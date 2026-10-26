import appConfig from "config/app";

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

// Catalyst expects the CSRF cookie echoed back on state-changing requests.
function csrfHeader() {
  const match = document.cookie.match(/(?:^|;\s*)ZD_CSRF_TOKEN=([^;]+)/);
  return match ? { "X-ZCSRF-TOKEN": `zd_csrparam=${match[1]}` } : {};
}

export async function request(path, { method = "GET", body, formData, signal } = {}) {
  const headers = { Accept: "application/json" };
  if (method !== "GET") Object.assign(headers, csrfHeader());
  if (body && !formData) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${appConfig.apiBase}${path}`, {
      method,
      headers,
      body: formData || (body ? JSON.stringify(body) : undefined),
      credentials: "same-origin",
      signal,
    });
  } catch (networkError) {
    if (networkError.name === "AbortError") throw networkError;
    throw new ApiError("Can't reach PowerGate right now. Check your connection and try again.", 0);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (parseError) {
    payload = null;
  }

  if (!response.ok || (payload && payload.status === "error")) {
    const message =
      (payload && payload.message) || `Something went wrong (HTTP ${response.status}).`;
    throw new ApiError(message, response.status, payload);
  }

  return payload && Object.prototype.hasOwnProperty.call(payload, "data") ? payload.data : payload;
}
