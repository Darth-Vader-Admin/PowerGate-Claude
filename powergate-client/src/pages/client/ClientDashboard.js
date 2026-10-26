import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PageHeader from "components/common/PageHeader";
import KpiGrid from "components/common/KpiGrid";
import KpiCard from "components/common/KpiCard";
import BatteryBar from "components/common/BatteryBar";
import SectionCard from "components/common/SectionCard";
import DataTable from "components/common/DataTable";
import StatusPill from "components/common/StatusPill";
import SearchInput from "components/common/SearchInput";
import FilterChips from "components/common/FilterChips";
import ConfirmDialog from "components/common/ConfirmDialog";
import useAsync from "hooks/useAsync";
import useToast from "hooks/useToast";
import { getClientSummary, getClientTasks, decideClientTask } from "api/powergate";
import { formatDate, formatHours, formatHoursMinutes } from "utils/format";
import tokens from "theme/tokens";

const historyFilters = [
  { value: "all", label: "All" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

export default function ClientDashboard() {
  const toast = useToast();
  const summary = useAsync(getClientSummary, []);
  const pending = useAsync(() => getClientTasks("pending"), []);
  const history = useAsync(() => getClientTasks("decided"), []);

  const [search, setSearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");
  const [dialog, setDialog] = useState(null); // { task, decision }
  const [busy, setBusy] = useState(false);

  const pendingRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = pending.data || [];
    if (!term) return rows;
    return rows.filter((t) => `${t.name} ${t.project}`.toLowerCase().includes(term));
  }, [pending.data, search]);

  const historyRows = useMemo(() => {
    const rows = history.data || [];
    return historyFilter === "all" ? rows : rows.filter((t) => t.approvalStatus === historyFilter);
  }, [history.data, historyFilter]);

  const handleDecision = async (note) => {
    if (!dialog) return;
    setBusy(true);
    try {
      await decideClientTask(dialog.task.id, dialog.decision, note);
      toast(
        dialog.decision === "approve"
          ? `Approved “${dialog.task.name}”. Your CSP has been notified.`
          : `Rejected “${dialog.task.name}”. Your CSP has been notified.`
      );
      setDialog(null);
      pending.reload();
      history.reload();
      summary.reload();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const battery = summary.data && summary.data.battery;
  const dialogTask = dialog && dialog.task;
  const overBattery = dialogTask && dialog.decision === "approve" && Number(dialogTask.batteryAfter) < 0;

  const pendingColumns = [
    { key: "name", label: "Task", strong: true },
    { key: "project", label: "Project", muted: true },
    { key: "dateAdded", label: "Date added", muted: true, num: true, nowrap: true, render: (t) => formatDate(t.dateAdded) },
    { key: "estimateHours", label: "Estimate", num: true, nowrap: true, render: (t) => formatHours(t.estimateHours) },
    {
      key: "batteryAfter",
      label: "Battery after",
      num: true,
      nowrap: true,
      render: (t) => (
        <Box component="span" sx={{ color: Number(t.batteryAfter) < 0 ? tokens.pill.error.fg : "inherit" }}>
          {formatHours(t.batteryAfter)}
        </Box>
      ),
    },
    { key: "status", label: "Status", render: () => <StatusPill label="Pending" tone="warning" /> },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (t) => (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
          <Button variant="contained" onClick={() => setDialog({ task: t, decision: "approve" })}>
            Approve
          </Button>
          <Button variant="outlined" onClick={() => setDialog({ task: t, decision: "reject" })}>
            Reject
          </Button>
        </Box>
      ),
    },
  ];

  const historyColumns = [
    { key: "name", label: "Task", strong: true },
    { key: "project", label: "Project", muted: true },
    { key: "estimateHours", label: "Estimate", num: true, nowrap: true, render: (t) => formatHours(t.estimateHours) },
    { key: "approvalStatus", label: "Decision", render: (t) => <StatusPill label={t.approvalStatus} /> },
    { key: "decidedOn", label: "Decided on", muted: true, num: true, nowrap: true, render: (t) => formatDate(t.decidedOn) },
    { key: "workStatus", label: "Work status", muted: true },
  ];

  return (
    <>
      <PageHeader
        eyebrow="PowerGate"
        title="My Dashboard"
        description="Review task estimates waiting on you and track every decision in one place."
        actions={
          <>
            <Button component={RouterLink} to="/client/profile" variant="outlined" size="large" startIcon={<PersonOutlineIcon />}>
              My profile
            </Button>
            <Button component={RouterLink} to="/client/requests" variant="contained" size="large" startIcon={<AddIcon />}>
              New request
            </Button>
          </>
        }
      />

      <KpiGrid>
        <KpiCard
          label="Awaiting your approval"
          value={summary.data ? summary.data.awaiting : "—"}
          valueColor={tokens.pill.warning.fg}
          caption="Sent to you by your CSP"
          loading={summary.loading}
        />
        <KpiCard
          label="Approved"
          value={summary.data ? summary.data.approved : "—"}
          valueColor={tokens.pill.success.fg}
          caption="All time"
          loading={summary.loading}
        />
        <KpiCard
          label="Rejected"
          value={summary.data ? summary.data.rejected : "—"}
          valueColor={tokens.pill.error.fg}
          caption="All time"
          loading={summary.loading}
        />
        <KpiCard
          label="Available hours"
          value={battery ? formatHoursMinutes(battery.available) : "—"}
          loading={summary.loading}
        >
          {battery && <BatteryBar battery={battery} />}
        </KpiCard>
      </KpiGrid>

      <SectionCard
        flush
        eyebrow="Pending"
        title="Awaiting your approval"
        actions={<SearchInput value={search} onChange={setSearch} placeholder="Search tasks" label="Search pending tasks" />}
      >
        <DataTable
          columns={pendingColumns}
          rows={pendingRows}
          loading={pending.loading}
          error={pending.error}
          onRetry={pending.reload}
          emptyText={search ? "No pending tasks match your search." : "You're all caught up — nothing is waiting on you."}
          minWidth={880}
        />
      </SectionCard>

      <SectionCard
        flush
        eyebrow="Approved / Rejected"
        title="Decision history"
        actions={<FilterChips options={historyFilters} value={historyFilter} onChange={setHistoryFilter} ariaLabel="Filter decision history" />}
      >
        <DataTable
          columns={historyColumns}
          rows={historyRows}
          loading={history.loading}
          error={history.error}
          onRetry={history.reload}
          emptyText="No decisions yet."
          minWidth={820}
        />
      </SectionCard>

      <ConfirmDialog
        open={Boolean(dialog)}
        title={dialog && dialog.decision === "approve" ? "Approve this estimate?" : "Reject this estimate?"}
        message={
          dialogTask ? (
            <>
              <strong>{dialogTask.name}</strong> · {dialogTask.project} · {formatHours(dialogTask.estimateHours)}
              {overBattery && (
                <Box component="span" sx={{ display: "block", mt: 1.5, color: tokens.pill.warning.fg }}>
                  This task needs more hours than you have available. If you approve, the extra hours
                  draw from your next battery.
                </Box>
              )}
              {dialog.decision === "reject" && (
                <Box component="span" sx={{ display: "block", mt: 1.5 }}>
                  No work starts on rejected tasks. Your CSP may contact you to adjust the scope.
                </Box>
              )}
            </>
          ) : null
        }
        confirmLabel={dialog && dialog.decision === "approve" ? "Approve" : "Reject"}
        destructive={Boolean(dialog && dialog.decision === "reject")}
        withNote={Boolean(dialog && dialog.decision === "reject")}
        noteLabel="Reason (optional, shared with your CSP)"
        busy={busy}
        onConfirm={handleDecision}
        onClose={() => setDialog(null)}
      />
    </>
  );
}
