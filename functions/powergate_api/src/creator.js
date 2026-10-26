"use strict";

// Minimal Zoho Creator REST API v2.1 client.
// Token: Catalyst Connector (zcatalyst-sdk-node) — caches the access token in Catalyst Cache and
// refreshes before expiry, so we don't burn Zoho's access-token generation limit per request.

const { settings, assertConfigured } = require("./config");
const { HttpError } = require("./errors");

const CONNECTOR = "PowerGateCreator";
const NO_RECORD_CODES = new Set([3100, 9280]); // "No data / no records" — treated as empty, confirm in logs

function debug(...args) {
  if (settings.debug) console.log("[creator] DEBUG", ...args); // DEBUG — remove/disable in production
}

async function getAccessToken(catalystApp) {
  const missing = assertConfigured();
  if (missing.length) throw new HttpError(500, "Server not configured.", `Missing env: ${missing.join(", ")}`);

  const connection = catalystApp.connection({
    [CONNECTOR]: {
      client_id: settings.zoho.clientId,
      client_secret: settings.zoho.clientSecret,
      auth_url: `${settings.zoho.accountsUrl}/oauth/v2/token`,
      refresh_url: `${settings.zoho.accountsUrl}/oauth/v2/token`,
      refresh_token: settings.zoho.refreshToken,
    },
  });
  try {
    return await connection.getConnector(CONNECTOR).getAccessToken();
  } catch (error) {
    throw new HttpError(502, "Couldn't connect to Zoho.", `Token refresh failed: ${error.message}`);
  }
}

function baseUrl() {
  const { apiUrl, owner, app } = settings.creator;
  return `${apiUrl}/creator/v2.1/data/${encodeURIComponent(owner)}/${encodeURIComponent(app)}`;
}

async function call(catalystApp, method, path, { query, body, formData, headers } = {}) {
  const token = await getAccessToken(catalystApp);
  const url = new URL(`${baseUrl()}${path}`);
  Object.entries(query || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });

  const init = {
    method,
    headers: { Authorization: `Zoho-oauthtoken ${token}`, ...(headers || {}) },
  };
  if (formData) init.body = formData;
  else if (body) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  debug(method, url.pathname, query && query.criteria ? `criteria=${query.criteria}` : "");
  let response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    throw new HttpError(502, "Couldn't reach Zoho Creator.", error.message);
  }

  let json = null;
  try {
    json = await response.json();
  } catch (e) {
    json = null;
  }
  debug("<-", response.status, json && json.code);

  if (json && NO_RECORD_CODES.has(Number(json.code))) return { json: { data: [] }, response, empty: true };
  if (!response.ok || !json || (json.code !== undefined && Number(json.code) !== 3000)) {
    const detail = `${method} ${url.pathname} -> HTTP ${response.status} ${JSON.stringify(json).slice(0, 800)}`;
    if (response.status === 401) throw new HttpError(502, "Zoho authorization failed.", detail);
    if (response.status === 429) throw new HttpError(503, "PowerGate is busy. Please try again in a minute.", detail);
    throw new HttpError(502, "Zoho Creator rejected the request.", detail);
  }
  return { json, response };
}

// Fetch records with criteria, following record_cursor pages up to settings.creator.maxRecords.
async function listRecords(catalystApp, report, criteria) {
  const { pageSize, maxRecords } = settings.creator;
  const rows = [];
  let cursor = null;
  do {
    // eslint-disable-next-line no-await-in-loop
    const { json, response, empty } = await call(catalystApp, "GET", `/report/${report}`, {
      query: { criteria, max_records: pageSize, field_config: "all" },
      headers: cursor ? { record_cursor: cursor } : undefined,
    });
    if (empty) break;
    rows.push(...(json.data || []));
    cursor = response.headers.get("record_cursor");
  } while (cursor && rows.length < maxRecords);
  if (cursor) console.warn(`[creator] ${report}: hit maxRecords cap (${maxRecords}); results truncated`);
  return rows;
}

async function getRecord(catalystApp, report, id) {
  if (!/^\d+$/.test(String(id))) throw new HttpError(400, "Invalid record id.");
  const { json, empty } = await call(catalystApp, "GET", `/report/${report}/${id}`, {
    query: { field_config: "all" },
  });
  if (empty || !json.data) throw new HttpError(404, "Record not found.");
  return Array.isArray(json.data) ? json.data[0] : json.data;
}

async function createRecord(catalystApp, form, data) {
  const { json } = await call(catalystApp, "POST", `/form/${form}`, {
    body: { data, result: { fields: [], message: true, tasks: true } },
  });
  const created = Array.isArray(json.data) ? json.data[0] : json.data;
  const id = created && (created.ID || (created.data && created.data.ID));
  if (!id) throw new HttpError(502, "Zoho Creator didn't return the new record.", JSON.stringify(json).slice(0, 500));
  return String(id);
}

async function updateRecord(catalystApp, report, id, data) {
  if (!/^\d+$/.test(String(id))) throw new HttpError(400, "Invalid record id.");
  const { json } = await call(catalystApp, "PATCH", `/report/${report}/${id}`, { body: { data } });
  return json.data;
}

// Upload one file into a file-upload field of an existing record.
async function uploadFile(catalystApp, report, id, fieldName, file) {
  const formData = new FormData();
  formData.append("file", new Blob([file.buffer], { type: file.mimetype }), file.originalname);
  await call(catalystApp, "POST", `/report/${report}/${id}/${fieldName}/upload`, { formData });
}

// ---------- criteria helpers ----------
function quote(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function and(...parts) {
  const clean = parts.filter(Boolean);
  return clean.length ? `(${clean.join(" && ")})` : undefined;
}

module.exports = { listRecords, getRecord, createRecord, updateRecord, uploadFile, quote, and };
