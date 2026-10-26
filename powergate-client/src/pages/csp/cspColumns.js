// Column builders shared by the CSP approval screen and task lists.
import Box from "@mui/material/Box";
import StatusPill from "components/common/StatusPill";
import { batteryTone, formatDate, formatHours } from "utils/format";

export const taskNameCell = (t) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
    <Box component="span" sx={{ fontWeight: 700 }}>{t.name}</Box>
    <Box component="span" className="num" sx={{ fontSize: 12, color: "#8f8f8f" }}>
      Added {formatDate(t.dateAdded)}
    </Box>
  </Box>
);

export const batteryCell = (available, threshold) => (
  <StatusPill label={formatHours(available)} tone={batteryTone(available, threshold)} />
);

export const approvalLabel = (t) => {
  if (t.approvalStatus !== "Pending") return t.approvalStatus;
  return t.sentToClient ? "With client" : "Not sent";
};

export const baseTaskColumns = [
  { key: "name", label: "Task", render: taskNameCell },
  { key: "project", label: "Project", muted: true },
  { key: "client", label: "Client", muted: true },
  { key: "estimateHours", label: "Estimate", num: true, nowrap: true, render: (t) => formatHours(t.estimateHours) },
  { key: "approval", label: "Approval", render: (t) => <StatusPill label={approvalLabel(t)} tone={t.approvalStatus === "Pending" ? (t.sentToClient ? "warning" : "neutral") : undefined} /> },
  { key: "decidedOn", label: "Decided on", muted: true, num: true, nowrap: true, render: (t) => formatDate(t.decidedOn) },
  { key: "workStatus", label: "Work status", muted: true },
];
