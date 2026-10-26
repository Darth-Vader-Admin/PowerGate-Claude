"use strict";

// Runtime settings (env) + Creator schema map.
// Every Creator link name below is a PLACEHOLDER — confirm each one in the PowerGate Creator app
// (Form/Report properties, field "Field Link Name") before going live.

const env = process.env;

const settings = {
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
    dateFormat: env.CREATOR_DATE_FORMAT || "dd-MMM-yyyy",
    pageSize: 200, // v2.1 max_records: 200 | 500 | 1000
    maxRecords: 1000, // hard cap per list call, protects API quota
  },
  roles: {
    csp: env.CSP_ROLE_NAME || "CSP",
    client: env.CLIENT_ROLE_NAME || "Client",
    // Set CSP_EMAIL_DOMAIN to an empty string to turn this guard off.
    cspEmailDomain: (env.CSP_EMAIL_DOMAIN ?? "bickertmanagement.com").toLowerCase(),
  },
  rules: {
    cspApprovalRequiresThreshold: (env.CSP_APPROVAL_REQUIRES_THRESHOLD || "true") === "true",
    minRequestWords: 10,
    maxRequestFiles: 10,
    maxFileSizeMb: 10,
  },
  debug: env.DEBUG_LOGS === "true",
};

// ---------------- Creator schema (PLACEHOLDERS) ----------------
const schema = {
  customers: {
    report: "All_Customers",
    fields: {
      name: "Customer_Name",
      primaryEmail: "Primary_Email",
      // Multi-line / text field holding other authorized emails (comma or newline separated).
      authorizedEmails: "Authorized_Users",
      powerPlan: "PowerPlan",
      status: "Status",
      batteryMax: "Battery_Max",
      batteryUsed: "Battery_Used",
      batteryCommitted: "Battery_Committed",
    },
  },
  projects: {
    form: "Project",
    report: "All_Projects",
    fields: {
      name: "Project_Name",
      customer: "Customer", // lookup -> Customers
      customerEmail: "Client_Email",
      cspEmail: "CSP_Email",
      batteryType: "Battery_Type",
      available: "Available_Hours",
      threshold: "Approval_Threshold",
      status: "Status",
    },
  },
  tasks: {
    form: "Task",
    report: "All_Tasks",
    fields: {
      name: "Task_Name",
      description: "Description",
      project: "Project", // lookup -> Projects
      customer: "Customer", // lookup -> Customers
      clientEmail: "Client_Email",
      cspEmail: "CSP_Email",
      requestedBy: "Requested_By",
      dateAdded: "Added_Time", // system field
      estimateHours: "Estimated_Hours",
      approvalStatus: "Approval_Status", // Pending | Approved | Rejected
      sentToClient: "Sent_For_Approval", // decision box
      decidedOn: "Decision_Date",
      decidedBy: "Decided_By",
      decisionNote: "Decision_Note",
      workStatus: "Work_Status",
      externalTaskId: "Projects_Task_ID",
      externalProjectId: "Projects_Project_ID",
    },
    values: { pending: "Pending", approved: "Approved", rejected: "Rejected", defaultWorkStatus: "Open" },
  },
  requests: {
    form: "Request_Form",
    report: "Request_Form_Report",
    fields: {
      type: "Request_Type",
      plan: "PowerPlan",
      description: "Description",
      consent: "Consent", // decision box
      customer: "Customer", // lookup -> Customers
      clientEmail: "Client_Email",
      submittedOn: "Added_Time",
      status: "Status",
    },
    // One Creator file-upload field holds one file. List the file fields in upload order.
    fileFields: ["File_1", "File_2", "File_3", "File_4", "File_5", "File_6", "File_7", "File_8", "File_9", "File_10"],
    allowedTypes: ["New Task Request", "Change PowerPlan", "Opt for Trickle Charge", "Opt for Metered Transmission"],
    allowedPlans: ["EcoGrid", "Amped", "Lightning"],
    defaultStatus: "Pending",
  },
};

function assertConfigured() {
  const missing = [];
  if (!settings.zoho.clientId) missing.push("ZOHO_CLIENT_ID");
  if (!settings.zoho.clientSecret) missing.push("ZOHO_CLIENT_SECRET");
  if (!settings.zoho.refreshToken) missing.push("ZOHO_REFRESH_TOKEN");
  if (!settings.creator.owner) missing.push("CREATOR_OWNER");
  if (!settings.creator.app) missing.push("CREATOR_APP");
  return missing;
}

module.exports = { settings, schema, assertConfigured };
