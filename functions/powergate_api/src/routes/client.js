"use strict";

const express = require("express");
const multer = require("multer");
const { schema, settings } = require("../config");
const { requireRole } = require("../auth");
const { asyncRoute, HttpError } = require("../errors");
const { resolveCustomer } = require("../customer");
const creator = require("../creator");
const { toTask, toProject, toRequest, creatorDate } = require("../mappers");

const router = express.Router();
router.use(requireRole("client"));

const T = schema.tasks;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: settings.rules.maxRequestFiles, fileSize: settings.rules.maxFileSizeMb * 1024 * 1024 },
});

// All tasks for this customer that the CSP has sent for client approval.
// ASSUMPTION: lookup criteria by record ID (Customer == 123) — confirm against your app.
async function customerTasks(req) {
  const customer = await resolveCustomer(req);
  const criteria = creator.and(`${T.fields.customer} == ${customer.id}`, `${T.fields.sentToClient} == true`);
  const rows = await creator.listRecords(req.catalystApp, T.report, criteria);
  return { customer, tasks: rows.map(toTask) };
}

router.get(
  "/summary",
  asyncRoute(async (req, res) => {
    const { customer, tasks } = await customerTasks(req);
    const count = (status) => tasks.filter((t) => t.approvalStatus === status).length;
    res.json({
      status: "success",
      data: {
        awaiting: count(T.values.pending),
        approved: count(T.values.approved),
        rejected: count(T.values.rejected),
        battery: customer.battery,
      },
    });
  })
);

router.get(
  "/tasks",
  asyncRoute(async (req, res) => {
    const view = String(req.query.view || "all");
    const { customer, tasks } = await customerTasks(req);
    const available = customer.battery.available;
    const rows = tasks
      .filter((t) => {
        if (view === "pending") return t.approvalStatus === T.values.pending;
        if (view === "decided") return t.approvalStatus !== T.values.pending;
        return true;
      })
      .map((t) => ({
        ...t,
        batteryAfter: t.estimateHours === null ? null : Math.round((available - t.estimateHours) * 100) / 100,
      }));
    res.json({ status: "success", data: rows });
  })
);

router.post(
  "/tasks/:id/decision",
  asyncRoute(async (req, res) => {
    const decision = String((req.body && req.body.decision) || "");
    const note = String((req.body && req.body.note) || "").slice(0, 2000);
    if (!["approve", "reject"].includes(decision)) throw new HttpError(400, "Choose approve or reject.");

    const customer = await resolveCustomer(req);
    const task = toTask(await creator.getRecord(req.catalystApp, T.report, req.params.id));

    // Ownership + state checks happen here, not in the browser.
    if (task.customerId !== customer.id || !task.sentToClient) throw new HttpError(404, "Task not found.");
    if (task.approvalStatus !== T.values.pending) {
      throw new HttpError(409, `This task was already ${task.approvalStatus.toLowerCase()}. Refresh to see the latest.`);
    }

    const f = T.fields;
    const data = {
      [f.approvalStatus]: decision === "approve" ? T.values.approved : T.values.rejected,
      [f.decidedOn]: creatorDate(),
      [f.decidedBy]: req.pgUser.email,
    };
    if (note) data[f.decisionNote] = note;
    await creator.updateRecord(req.catalystApp, T.report, task.id, data);

    res.json({ status: "success", data: { ...task, approvalStatus: data[f.approvalStatus], decidedOn: data[f.decidedOn] } });
  })
);

router.get(
  "/profile",
  asyncRoute(async (req, res) => {
    const customer = await resolveCustomer(req);
    const P = schema.projects;
    const projectRows = await creator.listRecords(req.catalystApp, P.report, `(${P.fields.customer} == ${customer.id})`);
    const users = [
      { email: customer.primaryEmail, role: "Primary" },
      ...customer.authorizedEmails
        .filter((e) => e !== customer.primaryEmail)
        .map((email) => ({ email, role: "Authorized" })),
    ];
    res.json({
      status: "success",
      data: {
        customerName: customer.customerName,
        primaryEmail: customer.primaryEmail,
        powerPlan: customer.powerPlan,
        status: customer.status,
        battery: customer.battery,
        users,
        projects: projectRows.map(toProject).map((p) => ({ name: p.name, cspEmail: p.cspEmail, status: p.status })),
      },
    });
  })
);

router.get(
  "/requests",
  asyncRoute(async (req, res) => {
    const customer = await resolveCustomer(req);
    const R = schema.requests;
    const rows = await creator.listRecords(req.catalystApp, R.report, `(${R.fields.customer} == ${customer.id})`);
    res.json({ status: "success", data: rows.map(toRequest) });
  })
);

router.post(
  "/requests",
  upload.array("files", settings.rules.maxRequestFiles),
  asyncRoute(async (req, res) => {
    const R = schema.requests;
    const f = R.fields;
    const body = req.body || {};
    const type = String(body.type || "");
    const description = String(body.description || "").trim();
    const plan = String(body.plan || "");
    const consent = body.consent === "true";
    const files = req.files || [];

    if (!R.allowedTypes.includes(type)) throw new HttpError(400, "Choose a request type.");
    const isTask = type === R.allowedTypes[0];
    if (isTask && description.split(/\s+/).filter(Boolean).length < settings.rules.minRequestWords) {
      throw new HttpError(400, `Please describe the work in at least ${settings.rules.minRequestWords} words.`);
    }
    if (type === "Change PowerPlan" && !R.allowedPlans.includes(plan)) throw new HttpError(400, "Choose a PowerPlan.");
    if (!isTask && !consent) throw new HttpError(400, "Please confirm you agree to enroll.");
    if (files.length > R.fileFields.length) throw new HttpError(400, `Attach up to ${R.fileFields.length} files.`);

    const customer = await resolveCustomer(req);
    const data = {
      [f.type]: type,
      [f.customer]: customer.id,
      [f.clientEmail]: req.pgUser.email,
      [f.status]: R.defaultStatus,
    };
    if (isTask) data[f.description] = description;
    if (type === "Change PowerPlan") data[f.plan] = plan;
    if (!isTask) data[f.consent] = true;

    const id = await creator.createRecord(req.catalystApp, R.form, data);

    // Sequential uploads: one Creator API call per file (counts against the API quota).
    const failed = [];
    for (let i = 0; i < files.length; i += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await creator.uploadFile(req.catalystApp, R.report, id, R.fileFields[i], files[i]);
      } catch (error) {
        console.error("[requests] upload failed", files[i].originalname, error.detail || error.message);
        failed.push(files[i].originalname);
      }
    }

    if (failed.length) {
      throw new HttpError(
        502,
        `Your request was submitted, but these files didn't upload: ${failed.join(", ")}. Email them to customer service.`
      );
    }

    res.status(201).json({
      status: "success",
      data: { id, type, plan, submittedOn: creatorDate(), fileCount: files.length, status: R.defaultStatus },
    });
  })
);

module.exports = router;
