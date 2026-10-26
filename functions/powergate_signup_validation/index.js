"use strict";

// Catalyst Custom User Validation (Basic I/O).
// Runs once, when someone signs up. Creator decides who gets in and with which role:
//   - CSP:    email on the BMI domain (and, if CSP_REPORT is set, listed in that Creator report)
//   - Client: email is the Primary or an Authorized user on a Creator Customer record
//   - anyone else: rejected
// Fails closed: any error = sign-up refused.

const catalyst = require("zcatalyst-sdk-node");

const env = process.env;
const CONFIG = {
  roles: {
    csp: env.CSP_ROLE_NAME || "CSP", // must match the role name in Catalyst > Authentication > Roles
    client: env.CLIENT_ROLE_NAME || "Client",
  },
  cspEmailDomain: (env.CSP_EMAIL_DOMAIN ?? "bickertmanagement.com").toLowerCase(),
  zoho: {
    clientId: env.ZOHO_CLIENT_ID || "",
    clientSecret: env.ZOHO_CLIENT_SECRET || "",
    refreshToken: env.ZOHO_REFRESH_TOKEN || "",
    accountsUrl: (env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com").replace(/\/$/, ""),
  },
  creator: {
    apiUrl: (env.CREATOR_API_URL || "https://www.zohoapis.com").replace(/\/$/, ""),
    owner: env.CREATOR_OWNER || "",
    app: env.CREATOR_APP || "",
  },
  // PLACEHOLDER link names — same ones as functions/powergate_api/src/config.js
  customers: {
    report: env.CUSTOMERS_REPORT || "All_Customers",
    primaryEmail: "Primary_Email",
    authorizedEmails: "Authorized_Users",
  },
  // Optional: a Creator report listing active CSPs. Empty = domain check only.
  csp: {
    report: env.CSP_REPORT || "",
    emailField: env.CSP_EMAIL_FIELD || "Email",
  },
};

const NO_RECORD_CODES = new Set([3100, 9280]);

function quote(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

async function getAccessToken(app) {
  const connection = app.connection({
    PowerGateCreator: {
      client_id: CONFIG.zoho.clientId,
      client_secret: CONFIG.zoho.clientSecret,
      auth_url: `${CONFIG.zoho.accountsUrl}/oauth/v2/token`,
      refresh_url: `${CONFIG.zoho.accountsUrl}/oauth/v2/token`,
      refresh_token: CONFIG.zoho.refreshToken,
    },
  });
  return connection.getConnector("PowerGateCreator").getAccessToken();
}

// Returns matching records (max 200 — sign-up lookups only ever need one).
async function findRecords(token, report, criteria) {
  const { apiUrl, owner, app } = CONFIG.creator;
  const url = new URL(`${apiUrl}/creator/v2.1/data/${encodeURIComponent(owner)}/${encodeURIComponent(app)}/report/${report}`);
  url.searchParams.set("criteria", criteria);
  url.searchParams.set("max_records", "200");

  const response = await fetch(url, { headers: { Authorization: `Zoho-oauthtoken ${token}` } });
  const json = await response.json().catch(() => null);
  if (json && NO_RECORD_CODES.has(Number(json.code))) return [];
  if (!response.ok || !json || Number(json.code) !== 3000) {
    throw new Error(`Creator ${report} lookup failed: HTTP ${response.status} ${JSON.stringify(json).slice(0, 300)}`);
  }
  return json.data || [];
}

function emailsIn(value) {
  return String(value || "")
    .split(/[\s,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes("@"));
}

async function decideRole(app, email) {
  const token = await getAccessToken(app);

  if (CONFIG.cspEmailDomain && email.endsWith(`@${CONFIG.cspEmailDomain}`)) {
    if (!CONFIG.csp.report) return CONFIG.roles.csp;
    const csps = await findRecords(token, CONFIG.csp.report, `(${CONFIG.csp.emailField} == ${quote(email)})`);
    return csps.length ? CONFIG.roles.csp : null;
  }

  const c = CONFIG.customers;
  let rows = await findRecords(token, c.report, `(${c.primaryEmail} == ${quote(email)})`);
  if (!rows.length) {
    // ASSUMPTION: .contains() criteria works on this text field — same assumption as powergate_api.
    rows = await findRecords(token, c.report, `(${c.authorizedEmails}.contains(${quote(email)}))`);
  }
  const match = rows.some(
    (r) => String(r[c.primaryEmail] || "").trim().toLowerCase() === email || emailsIn(r[c.authorizedEmails]).includes(email)
  );
  return match ? CONFIG.roles.client : null;
}

module.exports = async (context, basicIO) => {
  let result = { status: "failure" };
  try {
    const app = catalyst.initialize(context);
    const request = app.userManagement().getSignupValidationRequest(basicIO);
    const user = request && request.user_details;
    const email = String((user && user.email_id) || "").trim().toLowerCase();

    if (email) {
      const role = await decideRole(app, email);
      if (role) {
        result = {
          status: "success",
          user_details: {
            first_name: user.first_name || email.split("@")[0],
            last_name: user.last_name || "",
            role_identifier: role, // confirm in console whether this expects the role name or role ID
          },
        };
      }
      console.log(`[signup-validation] ${email} -> ${role || "rejected"}`);
    }
  } catch (error) {
    console.error("[signup-validation] error, refusing sign-up:", error.message);
    result = { status: "failure" };
  }
  basicIO.write(JSON.stringify(result));
  context.close();
};
