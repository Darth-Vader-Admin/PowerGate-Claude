"use strict";

class HttpError extends Error {
  constructor(status, message, detail) {
    super(message);
    this.status = status;
    this.detail = detail; // server-side only, never sent to the browser
  }
}

// Wrap async route handlers so rejections reach errorHandler.
const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function notFound(req, res) {
  res.status(404).json({ status: "error", message: "Not found." });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || (err.code === "LIMIT_FILE_SIZE" ? 413 : 500);
  // Catalyst function logs (console) — includes Creator detail, never tokens.
  console.error("[powergate_api]", req.method, req.originalUrl, status, err.message, err.detail || "");
  const message =
    status >= 500
      ? "PowerGate couldn't complete that right now. Please try again, or contact customer service."
      : err.message;
  res.status(status).json({ status: "error", message });
}

module.exports = { HttpError, asyncRoute, notFound, errorHandler };
