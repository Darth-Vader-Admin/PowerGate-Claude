"use strict";

// Creator record -> UI shape. The UI only ever sees these shapes, so a Creator rename
// means changing config.js, not the React app.

const { schema, settings } = require("./config");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Lookup fields come back as { ID, display_value } (or arrays of them for multi-select).
function display(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(display).filter(Boolean).join(", ");
  if (typeof value === "object") return value.display_value || value.zc_display_value || "";
  return String(value);
}

function lookupId(value) {
  if (!value) return "";
  if (Array.isArray(value)) return lookupId(value[0]);
  if (typeof value === "object") return String(value.ID || "");
  return String(value);
}

function num(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isNaN(n) ? null : n;
}

function bool(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function lower(value) {
  return String(value || "").trim().toLowerCase();
}

// Today's date in the Creator app's date format (only dd-MMM-yyyy and yyyy-MM-dd / dd/MM/yyyy / MM/dd/yyyy handled).
function creatorDate(date = new Date()) {
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  switch (settings.creator.dateFormat) {
    case "yyyy-MM-dd":
      return `${yyyy}-${mm}-${dd}`;
    case "dd/MM/yyyy":
      return `${dd}/${mm}/${yyyy}`;
    case "MM/dd/yyyy":
      return `${mm}/${dd}/${yyyy}`;
    default:
      return `${dd}-${MONTHS[date.getUTCMonth()]}-${yyyy}`;
  }
}

function toTask(r) {
  const f = schema.tasks.fields;
  return {
    id: String(r.ID),
    name: display(r[f.name]),
    description: display(r[f.description]),
    project: display(r[f.project]),
    projectId: lookupId(r[f.project]),
    client: display(r[f.customer]),
    customerId: lookupId(r[f.customer]),
    clientEmail: lower(r[f.clientEmail]),
    cspEmail: lower(r[f.cspEmail]),
    requestedBy: display(r[f.requestedBy]),
    dateAdded: display(r[f.dateAdded]),
    estimateHours: num(r[f.estimateHours]),
    approvalStatus: display(r[f.approvalStatus]) || schema.tasks.values.pending,
    sentToClient: bool(r[f.sentToClient]),
    decidedOn: display(r[f.decidedOn]),
    workStatus: display(r[f.workStatus]),
    externalTaskId: display(r[f.externalTaskId]),
    externalProjectId: display(r[f.externalProjectId]),
  };
}

function toProject(r) {
  const f = schema.projects.fields;
  return {
    id: String(r.ID),
    name: display(r[f.name]),
    customer: display(r[f.customer]),
    customerId: lookupId(r[f.customer]),
    customerEmail: lower(r[f.customerEmail]),
    cspEmail: lower(r[f.cspEmail]),
    batteryType: display(r[f.batteryType]),
    available: num(r[f.available]),
    threshold: num(r[f.threshold]),
    status: display(r[f.status]) || "Active",
  };
}

function authorizedEmails(r) {
  const f = schema.customers.fields;
  return display(r[f.authorizedEmails])
    .split(/[\s,;]+/)
    .map(lower)
    .filter((e) => e.includes("@"));
}

function toBattery(r) {
  const f = schema.customers.fields;
  const max = num(r[f.batteryMax]) || 0;
  const used = num(r[f.batteryUsed]) || 0;
  const committed = num(r[f.batteryCommitted]) || 0;
  return { max, used, committed, available: Math.round((max - used - committed) * 100) / 100 };
}

function toCustomer(r) {
  const f = schema.customers.fields;
  return {
    id: String(r.ID),
    customerName: display(r[f.name]),
    primaryEmail: lower(r[f.primaryEmail]),
    powerPlan: display(r[f.powerPlan]),
    status: display(r[f.status]) || "Active",
    battery: toBattery(r),
    authorizedEmails: authorizedEmails(r),
  };
}

function toRequest(r) {
  const f = schema.requests.fields;
  const fileCount = schema.requests.fileFields.filter((field) => r[field] && display(r[field]) !== "").length;
  return {
    id: String(r.ID),
    type: display(r[f.type]),
    plan: display(r[f.plan]),
    submittedOn: display(r[f.submittedOn]),
    fileCount,
    status: display(r[f.status]) || schema.requests.defaultStatus,
  };
}

module.exports = { toTask, toProject, toCustomer, toRequest, creatorDate, lower, num };
