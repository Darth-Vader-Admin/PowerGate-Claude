"use strict";

const express = require("express");
const { asyncRoute, HttpError } = require("../errors");
const { resolveCustomer } = require("../customer");

const router = express.Router();

// Who am I + which side of PowerGate do I get. Clients must map to a Customer record.
router.get(
  "/",
  asyncRoute(async (req, res) => {
    const { email, name, role } = req.pgUser;
    if (!role) {
      throw new HttpError(403, "Your account doesn't have PowerGate access yet. Contact customer service.");
    }
    if (role === "client") await resolveCustomer(req);
    res.json({ status: "success", data: { email, name, role } });
  })
);

module.exports = router;
