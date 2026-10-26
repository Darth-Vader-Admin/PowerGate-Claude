"use strict";

// PowerGate API — Catalyst Advanced I/O function.
// Every route resolves the signed-in Catalyst user first, then reads/writes Creator on their behalf
// with scoping enforced here (never trusted from the browser).

const express = require("express");
const { attachUser } = require("./src/auth");
const { errorHandler, notFound } = require("./src/errors");
const meRoutes = require("./src/routes/me");
const clientRoutes = require("./src/routes/client");
const cspRoutes = require("./src/routes/csp");

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

// Health check without auth (useful after deploy).
app.get("/api/health", (req, res) => res.json({ status: "success", data: { ok: true } }));

app.use("/api", attachUser);
app.use("/api/me", meRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/csp", cspRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
