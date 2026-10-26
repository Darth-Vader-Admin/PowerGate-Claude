// Single API surface for the UI. Pages call these functions only — never fetch() directly —
// so mock mode and the Catalyst backend stay interchangeable.
import appConfig from "config/app";
import { request } from "api/http";
import { buildMockDb, mockUsers } from "api/mockData";
import { formatDate } from "utils/format";

const useMock = appConfig.useMock;
let mockDb = buildMockDb();
let mockRole = "client";

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
const today = () => formatDate(new Date().toISOString());
const clone = (value) => JSON.parse(JSON.stringify(value));

export function setMockRole(role) {
  mockRole = role;
}

// ---------- Session ----------
export async function getMe() {
  if (useMock) {
    await delay(150);
    return mockUsers[mockRole];
  }
  return request("/me");
}

// ---------- Client ----------
export async function getClientSummary() {
  if (useMock) {
    await delay();
    const mine = mockDb.tasks.filter((t) => t.clientEmail === mockUsers.client.email && t.sentToClient);
    return {
      awaiting: mine.filter((t) => t.approvalStatus === "Pending").length,
      approved: mine.filter((t) => t.approvalStatus === "Approved").length,
      rejected: mine.filter((t) => t.approvalStatus === "Rejected").length,
      battery: clone(mockDb.profile.battery),
    };
  }
  return request("/client/summary");
}

// view: "pending" | "decided" | "all"
export async function getClientTasks(view = "all") {
  if (useMock) {
    await delay();
    const mine = mockDb.tasks.filter((t) => t.clientEmail === mockUsers.client.email && t.sentToClient);
    const battery = mockDb.profile.battery.available;
    const rows = mine
      .filter((t) => {
        if (view === "pending") return t.approvalStatus === "Pending";
        if (view === "decided") return t.approvalStatus !== "Pending";
        return true;
      })
      .map((t) => ({ ...t, batteryAfter: battery - t.estimateHours }));
    return clone(rows);
  }
  return request(`/client/tasks?view=${encodeURIComponent(view)}`);
}

// decision: "approve" | "reject"
export async function decideClientTask(taskId, decision, note = "") {
  if (useMock) {
    await delay();
    const task = mockDb.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error("Task not found.");
    task.approvalStatus = decision === "approve" ? "Approved" : "Rejected";
    task.decidedOn = today();
    task.decisionNote = note;
    if (decision === "approve") {
      mockDb.profile.battery.committed += task.estimateHours;
      mockDb.profile.battery.available -= task.estimateHours;
    }
    return clone(task);
  }
  return request(`/client/tasks/${encodeURIComponent(taskId)}/decision`, {
    method: "POST",
    body: { decision, note },
  });
}

export async function getClientProfile() {
  if (useMock) {
    await delay();
    return clone(mockDb.profile);
  }
  return request("/client/profile");
}

export async function getClientRequests() {
  if (useMock) {
    await delay();
    return clone(mockDb.requests);
  }
  return request("/client/requests");
}

// payload: { type, description, plan, consent, files: File[] }
export async function submitClientRequest(payload) {
  if (useMock) {
    await delay(600);
    const row = {
      id: `r${Date.now()}`,
      type: payload.type,
      plan: payload.plan || "",
      submittedOn: today(),
      fileCount: (payload.files || []).length,
      status: "Pending",
    };
    mockDb.requests = [row, ...mockDb.requests];
    return clone(row);
  }
  const formData = new FormData();
  formData.append("type", payload.type);
  formData.append("description", payload.description || "");
  formData.append("plan", payload.plan || "");
  formData.append("consent", payload.consent ? "true" : "false");
  (payload.files || []).forEach((file) => formData.append("files", file, file.name));
  return request("/client/requests", { method: "POST", formData });
}

// ---------- CSP ----------
export async function getCspSummary() {
  if (useMock) {
    await delay();
    const mine = mockDb.tasks.filter((t) => t.cspEmail === mockUsers.csp.email);
    return {
      needsAction: mine.filter((t) => t.approvalStatus === "Pending" && !t.sentToClient).length,
      withClient: mine.filter((t) => t.approvalStatus === "Pending" && t.sentToClient).length,
      approved: mine.filter((t) => t.approvalStatus === "Approved").length,
      rejected: mine.filter((t) => t.approvalStatus === "Rejected").length,
    };
  }
  return request("/csp/summary");
}

// view: "pending" (mine, not sent) | "sent" (mine, sent to client) | "mine" | "all"
export async function getCspTasks(view = "pending") {
  if (useMock) {
    await delay();
    const withBattery = mockDb.tasks.map((t) => {
      const project = mockDb.projects.find((p) => p.id === t.projectId) || {};
      return { ...t, clientBattery: project.available, threshold: project.threshold };
    });
    const mine = withBattery.filter((t) => t.cspEmail === mockUsers.csp.email);
    const byView = {
      pending: mine.filter((t) => t.approvalStatus === "Pending" && !t.sentToClient),
      sent: mine.filter((t) => t.sentToClient),
      mine,
      all: withBattery,
    };
    return clone(byView[view] || []);
  }
  return request(`/csp/tasks?view=${encodeURIComponent(view)}`);
}

// action: "send" | "approve" | "reject"
export async function actOnCspTask(taskId, action, note = "") {
  if (useMock) {
    await delay();
    const task = mockDb.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error("Task not found.");
    if (action === "send") task.sentToClient = true;
    if (action === "approve" || action === "reject") {
      task.approvalStatus = action === "approve" ? "Approved" : "Rejected";
      task.decidedOn = today();
      task.decisionNote = note;
    }
    return clone(task);
  }
  return request(`/csp/tasks/${encodeURIComponent(taskId)}/action`, {
    method: "POST",
    body: { action, note },
  });
}

// scope: "mine" | "all"
export async function getCspProjects(scope = "mine") {
  if (useMock) {
    await delay();
    const rows =
      scope === "all"
        ? mockDb.projects
        : mockDb.projects.filter((p) => p.cspEmail === mockUsers.csp.email);
    return clone(rows);
  }
  return request(`/csp/projects?scope=${encodeURIComponent(scope)}`);
}

export async function createCspProject(payload) {
  if (useMock) {
    await delay(500);
    const row = {
      id: `p${Date.now()}`,
      name: payload.name,
      customer: payload.customer,
      batteryType: payload.batteryType,
      available: Number(payload.available) || 0,
      threshold: Number(payload.threshold) || 0,
      status: "Active",
      cspEmail: mockUsers.csp.email,
    };
    mockDb.projects = [...mockDb.projects, row];
    return clone(row);
  }
  return request("/csp/projects", { method: "POST", body: payload });
}

export async function createCspTask(payload) {
  if (useMock) {
    await delay(500);
    const project = mockDb.projects.find((p) => p.id === payload.projectId) || {};
    const row = {
      id: String(Date.now()),
      name: payload.name,
      project: project.name || "—",
      projectId: payload.projectId,
      client: project.customer || "—",
      clientEmail: mockUsers.client.email,
      requestedBy: payload.requestedBy || mockUsers.csp.email,
      dateAdded: today(),
      estimateHours: Number(payload.estimateHours) || 0,
      approvalStatus: "Pending",
      sentToClient: false,
      decidedOn: "",
      workStatus: "Open",
      cspEmail: mockUsers.csp.email,
      description: payload.description,
    };
    mockDb.tasks = [row, ...mockDb.tasks];
    return clone(row);
  }
  return request("/csp/tasks", { method: "POST", body: payload });
}

export function resetMockData() {
  mockDb = buildMockDb();
}
