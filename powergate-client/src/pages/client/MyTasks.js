import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import ReturnLink from "components/common/ReturnLink";
import PageHeader from "components/common/PageHeader";
import SectionCard from "components/common/SectionCard";
import DataTable from "components/common/DataTable";
import StatusPill from "components/common/StatusPill";
import SearchInput from "components/common/SearchInput";
import FilterChips from "components/common/FilterChips";
import useAsync from "hooks/useAsync";
import { getClientTasks } from "api/powergate";
import { formatDate, formatHours } from "utils/format";

const filters = [
  { value: "all", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

const columns = [
  { key: "name", label: "Task", strong: true },
  { key: "project", label: "Project", muted: true },
  { key: "dateAdded", label: "Date added", muted: true, num: true, nowrap: true, render: (t) => formatDate(t.dateAdded) },
  { key: "estimateHours", label: "Estimate", num: true, nowrap: true, render: (t) => formatHours(t.estimateHours) },
  { key: "approvalStatus", label: "Approval", render: (t) => <StatusPill label={t.approvalStatus} /> },
  { key: "decidedOn", label: "Decided on", muted: true, num: true, nowrap: true, render: (t) => formatDate(t.decidedOn) },
  { key: "workStatus", label: "Work status", muted: true },
];

export default function MyTasks() {
  const { data, loading, error, reload } = useAsync(() => getClientTasks("all"), []);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data || [])
      .filter((t) => filter === "all" || t.approvalStatus === filter)
      .filter((t) => !term || `${t.name} ${t.project}`.toLowerCase().includes(term));
  }, [data, filter, search]);

  return (
    <>
      <ReturnLink />
      <PageHeader title="My Tasks" description="Every task estimate your CSP has sent you, with its approval and work status." />
      <SectionCard
        flush
        title="All tasks"
        actions={
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <FilterChips options={filters} value={filter} onChange={setFilter} ariaLabel="Filter tasks" />
            <SearchInput value={search} onChange={setSearch} placeholder="Search tasks" />
          </Box>
        }
      >
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={reload}
          emptyText="No tasks match these filters."
          minWidth={900}
        />
      </SectionCard>
    </>
  );
}
