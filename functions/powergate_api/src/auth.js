"use strict";

const catalyst = require("zcatalyst-sdk-node");
const { settings } = require("./config");
const { HttpError, asyncRoute } = require("./errors");

// Resolves the Catalyst session user and maps their Catalyst role to "csp" | "client".
const attachUser = asyncRoute(async (req, res, next) => {
  const app = catalyst.initialize(req);
  req.catalystApp = app;

  let user;
  try {
    user = await app.userManagement().getCurrentUser();
  } catch (error) {
    throw new HttpError(401, "Please sign in again.", error.message);
  }
  if (!user || !user.email_id) throw new HttpError(401, "Please sign in again.");

  const roleName = ((user.role_details && user.role_details.role_name) || "").trim();
  const email = String(user.email_id).trim().toLowerCase();
  let role = null;
  if (roleName.toLowerCase() === settings.roles.csp.toLowerCase()) role = "csp";
  if (roleName.toLowerCase() === settings.roles.client.toLowerCase()) role = "client";

  // Defence in depth: a CSP role on a non-BMI email is treated as no access.
  if (role === "csp" && settings.roles.cspEmailDomain && !email.endsWith(`@${settings.roles.cspEmailDomain}`)) {
    role = null;
  }

  req.pgUser = {
    email,
    name: [user.first_name, user.last_name].filter(Boolean).join(" ") || email,
    role,
    catalystRole: roleName,
  };
  next();
});

function requireRole(role) {
  return (req, res, next) => {
    if (!req.pgUser || req.pgUser.role !== role) {
      return next(new HttpError(403, "You don't have access to this part of PowerGate."));
    }
    return next();
  };
}

module.exports = { attachUser, requireRole };
