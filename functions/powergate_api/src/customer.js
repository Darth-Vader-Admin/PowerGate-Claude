"use strict";

// Resolves which Customer record a signed-in client belongs to.
// Primary email match first; then the authorized-users field. Result is cached on the request.

const { schema } = require("./config");
const { listRecords, quote } = require("./creator");
const { toCustomer } = require("./mappers");
const { HttpError } = require("./errors");

async function resolveCustomer(req) {
  if (req.pgCustomer) return req.pgCustomer;
  const f = schema.customers.fields;
  const email = req.pgUser.email;

  let rows = await listRecords(req.catalystApp, schema.customers.report, `(${f.primaryEmail} == ${quote(email)})`);

  if (!rows.length) {
    // ASSUMPTION: Creator v2.1 criteria supports .contains() on text fields. If your org rejects it,
    // switch Authorized_Users to a subform / separate report and query that instead.
    rows = await listRecords(
      req.catalystApp,
      schema.customers.report,
      `(${f.authorizedEmails}.contains(${quote(email)}))`
    );
  }

  // .contains() is substring — re-check exact membership so a@x.com doesn't match aa@x.com.
  const match = rows
    .map(toCustomer)
    .find((c) => c.primaryEmail === email || c.authorizedEmails.includes(email));

  if (!match) {
    throw new HttpError(403, "Your account doesn't have PowerGate access yet. Contact customer service.");
  }
  if (rows.length > 1) {
    console.warn(`[customer] ${email} matches ${rows.length} customer records; using ${match.id}`);
  }
  req.pgCustomer = match;
  return match;
}

module.exports = { resolveCustomer };
