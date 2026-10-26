import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PageHeader from "components/common/PageHeader";
import KpiGrid from "components/common/KpiGrid";
import KpiCard from "components/common/KpiCard";
import SectionCard from "components/common/SectionCard";
import DataTable from "components/common/DataTable";
import StatusPill from "components/common/StatusPill";
import SearchInput from "components/common/SearchInput";
import FilterChips from "components/common/FilterChips";
import ConfirmDialog from "components/common/ConfirmDialog";
import useAsync from "hooks/useAsync";
import useCspTaskActions from "pages/csp/useCspTaskActions";
import { taskNameCell, batteryCell } from "pages/csp/cspColumns";
import { getCspSummary, getCspTasks, getCspProjects } from "api/powergate";
import appConfig from "config/app";
import { formatDate, formatHours } from "utils/format";
import tokens from "theme/tokens";

const sentFilters = [
  { value: "all", label: "All" },
  { value: "waiting", label: "Waiting" },
  { value: "decided", label: "Decided" },
];

function projectsTaskUrl(task) {
  if (!appConfig.zohoProjectsTaskUrl || !task.externalTaskId) return "";
  return appConfig.zohoProjectsTaskUrl
    .replace("{taskId}", encodeURIComponent(task.externalTaskId))
    .replace("{projectId}", encodeURIComponent(task.externalProjectId || ""));
}

export default function ApprovalScreen() {
  const summary = useAsync(getCspSummary, []);
  const pending = useAsync(() => getCspTasks("pending"), []);
  const sent = useAsync(() => getCspTasks("sent"), []);
  const projects = useAsync(() => getCspProjects("mine"), []);

  const [search, setSearch] = useState("");
  const [sentFilter, setSentFilter] = useState("all");

  const actions = useCspTaskActions(() => {
    summary.reload();
    pending.reload();
    sent.reload();
  });

  const pendingRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = pending.data || [];
    if (!term) return rows;
    return rows.filter((t) => `${t.name} ${t.project} ${t.client}`.toLowerCase().includes(term));
  }, [pending.data, search]);

  const sentRows = useMemo(() => {
    const rows = sent.data || [];
    if (sentFilter === "waiting") return rows.filter((t) => t.approvalStatus === "Pending");
    if (sentFilter === "decided") return rows.filter((t) => t.approvalStatus !== "Pending");
    return rows;
  }, [sent.data, sentFilter]);

  const pendingColumns = [
    { key: "name", label: "Task", render: taskNameCell },
    { key: "project", label: "Project", muted: true },
    { key: "client", label: "Client", muted: true },
    { key: "requestedBy", label: "Requested by", muted: true },
    { key: "estimateHours", label: "Estimate", num: true, nowrap: true, render: (t) => formatHours(t.estimateHours) },
    { key: "clientBattery", label: "Client battery", render: (t) => batteryCell(t.clientBattery, t.threshold) },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (t) => {
        const url = projectsTaskUrl(t);
        const overThreshold = t.threshold !== undefined && Number(t.estimateHours) > Number(t.threshold);
        return (
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", flexWrap: "nowrap" }}>
            <Button variant="contained" size="small" sx={{ whiteSpace: "nowrap" }} onClick={() => actions.request(t, "send")}>
              Send for approval
            </Button>
            <Tooltip title={overThreshold ? "Estimate is above this project's approval threshold — send it to the client instead." : ""}>
              <span>
                <Button variant="outlined" size="small" disabled={overThreshold} onClick={() => actions.request(t, "approve")}>
                  Approve
                </Button>
              </span>
            </Tooltip>
            <Button variant="outlined" size="small" onClick={() => actions.request(t, "reject")}>
              Reject
            </Button>
            {url && (
              <IconButton
                component="a"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open task in Zoho Projects"
                sx={{ border: `1px solid ${tokens.color.borderButton}`, borderRadius: "10px", width: 38, height: 38 }}
              >
                <OpenInNewIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        );
      },
    },
  ];

  const sentColumns = [
    { key: "name", label: "Task", strong: true },
    { key: "project", label: "Project", muted: true },
    { key: "client", label: "Client", muted: true },
    { key: "estimateHours", label: "Estimate", num: true, nowrap: true, render: (t) => formatHours(t.estimateHours) },
    { key: "approvalStatus", label: "Approval status", render: (t) => <StatusPill label={t.approvalStatus} /> },
    { key: "decidedOn", label: "Decided on", muted: true, num: true, nowrap: true, render: (t) => formatDate(t.decidedOn) },
    { key: "workStatus", label: "Work status", muted: true },
  ];

  const projectColumns = [
    { key: "name", label: "Project", strong: true },
    { key: "customer", label: "Customer", muted: true },
    { key: "batteryType", label: "Battery type", muted: true },
    { key: "available", label: "Available", render: (p) => batteryCell(p.available, p.threshold) },
    { key: "threshold", label: "Approval threshold", muted: true, num: true, render: (p) => formatHours(p.threshold) },
    { key: "status", label: "Status", render: (p) => <StatusPill label={p.status} /> },
  ];

  const s = summary.data || {};
  const dialogTask = actions.pendingAction && actions.pendingAction.task;

  return (
    <>
      <PageHeader
        eyebrow="PowerGate · CSP"
        title="Approval Screen"
        description="Estimate, send and track every customer task request assigned to you."
        actions={
          <>
            <Button component="a" href="#projects" variant="outlined" size="large">
              My projects
            </Button>
            <Button component={RouterLink} to="/csp/tasks/new" variant="contained" size="large" startIcon={<AddIcon />}>
              Add task
            </Button>
          </>
        }
      />

      <KpiGrid>
        <KpiCard label="Needs your action" value={s.needsAction ?? "—"} caption="Pending · not yet sent to client" loading={summary.loading} />
        <KpiCard label="With client" value={s.withClient ?? "—"} valueColor={tokens.pill.warning.fg} caption="Sent for approval · awaiting decision" loading={summary.loading} />
        <KpiCard label="Approved" value={s.approved ?? "—"} valueColor={tokens.pill.success.fg} caption="By you or the client" loading={summary.loading} />
        <KpiCard label="Rejected" value={s.rejected ?? "—"} valueColor={tokens.pill.error.fg} caption="By you or the client" loading={summary.loading} />
      </KpiGrid>

      <SectionCard
        flush
        eyebrow="Pending, not sent"
        title="My pending tasks"
        actions={<SearchInput value={search} onChange={setSearch} placeholder="Search tasks or clients" />}
      >
        <DataTable
          columns={pendingColumns}
          rows={pendingRows}
          loading={pending.loading}
          error={pending.error}
          onRetry={pending.reload}
          emptyText={search ? "No pending tasks match your search." : "Nothing waiting on you."}
          minWidth={1100}
        />
      </SectionCard>

      <SectionCard
        flush
        eyebrow="Sent for approval"
        title="Sent for client's approval"
        actions={<FilterChips options={sentFilters} value={sentFilter} onChange={setSentFilter} ariaLabel="Filter sent tasks" />}
      >
        <DataTable
          columns={sentColumns}
          rows={sentRows}
          loading={sent.loading}
          error={sent.error}
          onRetry={sent.reload}
          emptyText="No tasks sent to clients yet."
          minWidth={960}
        />
      </SectionCard>

      <SectionCard flush id="projects" title="My projects & battery">
        <DataTable
          columns={projectColumns}
          rows={projects.data || []}
          loading={projects.loading}
          error={projects.error}
          onRetry={projects.reload}
          emptyText="No projects assigned to you."
        />
      </SectionCard>

      <ConfirmDialog
        {...actions.dialogProps}
        message={
          dialogTask ? (
            <>
              <strong>{dialogTask.name}</strong> · {dialogTask.client} · {formatHours(dialogTask.estimateHours)}
            </>
          ) : null
        }
      />
    </>
  );
}
