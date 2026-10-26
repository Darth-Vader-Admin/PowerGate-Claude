"use strict";

const express = require("express");
const { schema, settings } = require("../config");
const { requireRole } = require("../auth");
const { asyncRoute, HttpError } = require("../errors");
const creator = require("../creator");
const { toTask, toProject, creatorDate, lower, num } = require("../mappers");

const router = express.Router();
router.use(requireRole("csp"));

const T = schema.tasks;
const P = schema.projects;
const mine = (req, field) => `${field} == ${creator.quote(req.pgUser.email)}`;

// Attach the project's battery + threshold to each task (one projects call, no per-row lookups).
async function withBattery(req, tasks) {
  const projectIds = new Set(tasks.map((t) => t.projectId).filter(Boolean));
  if (!projectIds.size) return tasks;
  const projects = (await creator.listRecords(req.catalystApp, P.report)).map(toProject);
  const byId = new Map(projects.map((p) => [p.id, p]));
  return tasks.map((t) => {
    const p = byId.get(t.projectId) || {};
    return { ...t, clientBattery: p.available ?? null, threshold: p.threshold ?? null };
  });
}

router.get(
  "/summary",
  asyncRoute(async (req, res) => {
    const tasks = (await creator.listRecords(req.catalystApp, T.report, `(${mine(req, T.fields.cspEmail)})`)).map(toTask);
    const pending = tasks.filter((t) => t.approvalStatus === T.values.pending);
    res.json({
      status: "success",
      data: {
        needsAction: pending.filter((t) => !t.sentToClient).length,
        withClient: pending.filter((t) => t.sentToClient).length,
        approved: tasks.filter((t) => t.approvalStatus === T.values.approved).length,
        rejected: tasks.filter((t) => t.approvalStatus === T.values.rejected).length,
      },
    });
  })
);

router.get(
  "/tasks",
  asyncRoute(async (req, res) => {
    const view = String(req.query.view || "pending");
    const f = T.fields;
    const criteriaByView = {
      pending: creator.and(mine(req, f.cspEmail), `${f.approvalStatus} == ${creator.quote(T.values.pending)}`, `${f.sentToClient} == false`),
      sent: creator.and(mine(req, f.cspEmail), `${f.sentToClient} == true`),
      mine: creator.and(mine(req, f.cspEmail)),
      all: undefined, // capped by settings.creator.maxRecords
    };
    if (!(view in criteriaByView)) throw new HttpError(400, "Unknown view.");
    const tasks = (await creator.listRecords(req.catalystApp, T.report, criteriaByView[view])).map(toTask);
    res.json({ status: "success", data: await withBattery(req, tasks) });
  })
);

router.post(
  "/tasks/:id/action",
  asyncRoute(async (req, res) => {
    const action = String((req.body && req.body.action) || "");
    const note = String((req.body && req.body.note) || "").slice(0, 2000);
    if (!["send", "approve", "reject"].includes(action)) throw new HttpError(400, "Unknown action.");

    const task = toTask(await creator.getRecord(req.catalystApp, T.report, req.params.id));
    if (task.cspEmail !== req.pgUser.email) throw new HttpError(403, "This task is assigned to another CSP.");
    if (task.approvalStatus !== T.values.pending) {
      throw new HttpError(409, `This task was already ${task.approvalStatus.toLowerCase()}. Refresh to see the latest.`);
    }

    const f = T.fields;
    let data;
    if (action === "send") {
      if (task.sentToClient) throw new HttpError(409, "Already sent to the client.");
      data = { [f.sentToClient]: true };
    } else {
      if (action === "approve" && settings.rules.cspApprovalRequiresThreshold) {
        const project = task.projectId ? toProject(await creator.getRecord(req.catalystApp, P.report, task.projectId)) : null;
        if (!project || project.threshold === null || task.estimateHours === null || task.estimateHours > project.threshold) {
          throw new HttpError(409, "This estimate is above the project's approval threshold. Send it to the client instead.");
        }
      }
      data = {
        [f.approvalStatus]: action === "approve" ? T.values.approved : T.values.rejected,
        [f.decidedOn]: creatorDate(),
        [f.decidedBy]: req.pgUser.email,
      };
      if (note) data[f.decisionNote] = note;
    }

    await creator.updateRecord(req.catalystApp, T.report, task.id, data);
    res.json({ status: "success", data: { id: task.id, action } });
  })
);

router.post(
  "/tasks",
  asyncRoute(async (req, res) => {
    const body = req.body || {};
    const name = String(body.name || "").trim();
    const estimate = num(body.estimateHours);
    if (!name) throw new HttpError(400, "Task name is required.");
    if (!(estimate > 0)) throw new HttpError(400, "Enter an estimate greater than 0.");

    const project = toProject(await creator.getRecord(req.catalystApp, P.report, body.projectId));
    if (project.cspEmail !== req.pgUser.email) throw new HttpError(403, "You can only add tasks to your own projects.");

    const f = T.fields;
    const data = {
      [f.name]: name,
      [f.project]: project.id,
      [f.customer]: project.customerId,
      [f.clientEmail]: project.customerEmail,
      [f.cspEmail]: req.pgUser.email,
      [f.requestedBy]: lower(body.requestedBy) || req.pgUser.email,
      [f.estimateHours]: estimate,
      [f.approvalStatus]: T.values.pending,
      [f.sentToClient]: false,
      [f.workStatus]: T.values.defaultWorkStatus,
    };
    const description = String(body.description || "").trim();
    if (description) data[f.description] = description;

    const id = await creator.createRecord(req.catalystApp, T.form, data);
    res.status(201).json({ status: "success", data: { id } });
  })
);

router.get(
  "/projects",
  asyncRoute(async (req, res) => {
    const scope = String(req.query.scope || "mine");
    const criteria = scope === "all" ? undefined : `(${mine(req, P.fields.cspEmail)})`;
    const rows = await creator.listRecords(req.catalystApp, P.report, criteria);
    res.json({ status: "success", data: rows.map(toProject) });
  })
);

router.post(
  "/projects",
  asyncRoute(async (req, res) => {
    const body = req.body || {};
    const f = P.fields;
    const name = String(body.name || "").trim();
    const customerEmail = lower(body.customerEmail);
    const threshold = num(body.threshold);
    if (!name) throw new HttpError(400, "Project name is required.");
    if (!/^\S+@\S+\.\S+$/.test(customerEmail)) throw new HttpError(400, "Enter the client's primary email.");
    if (threshold === null || threshold < 0) throw new HttpError(400, "Enter the approval threshold in hours.");

    // Link to the existing Customer record by primary email — PowerGate never creates customers.
    const C = schema.customers;
    const customers = await creator.listRecords(
      req.catalystApp,
      C.report,
      `(${C.fields.primaryEmail} == ${creator.quote(customerEmail)})`
    );
    if (!customers.length) {
      throw new HttpError(404, "No PowerGate customer has that primary email. Set the customer up in Creator first.");
    }

    const data = {
      [f.name]: name,
      [f.customer]: String(customers[0].ID),
      [f.customerEmail]: customerEmail,
      [f.cspEmail]: req.pgUser.email,
      [f.batteryType]: String(body.batteryType || ""),
      [f.threshold]: threshold,
      [f.status]: "Active",
    };
    const available = num(body.available);
    if (available !== null) data[f.available] = available;

    const id = await creator.createRecord(req.catalystApp, P.form, data);
    res.status(201).json({ status: "success", data: { id } });
  })
);

module.exports = router;
