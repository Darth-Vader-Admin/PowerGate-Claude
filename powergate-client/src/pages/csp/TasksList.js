import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import PageHeader from "components/common/PageHeader";
import SectionCard from "components/common/SectionCard";
import DataTable from "components/common/DataTable";
import SearchInput from "components/common/SearchInput";
import FilterChips from "components/common/FilterChips";
import useAsync from "hooks/useAsync";
import { baseTaskColumns } from "pages/csp/cspColumns";
import { getCspTasks } from "api/powergate";

const filters = [
  { value: "all", label: "All" },
  { value: "notsent", label: "Not sent" },
  { value: "withclient", label: "With client" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

function matchesFilter(t, filter) {
  if (filter === "all") return true;
  if (filter === "notsent") return t.approvalStatus === "Pending" && !t.sentToClient;
  if (filter === "withclient") return t.approvalStatus === "Pending" && t.sentToClient;
  return t.approvalStatus === filter;
}

// view "mine" = All CSP Tasks (assigned to me), "all" = every task.
export default function TasksList({ view }) {
  const { data, loading, error, reload } = useAsync(() => getCspTasks(view), [view]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data || [])
      .filter((t) => matchesFilter(t, filter))
      .filter((t) => !term || `${t.name} ${t.project} ${t.client}`.toLowerCase().includes(term));
  }, [data, search, filter]);

  return (
    <>
      <PageHeader
        eyebrow="PowerGate · CSP"
        title={view === "all" ? "All Tasks" : "All CSP Tasks"}
        description={view === "all" ? "Every PowerGate task across all projects." : "Every task on projects where you are the CSP."}
        actions={
          <Button component={RouterLink} to="/csp/tasks/new" variant="contained" size="large" startIcon={<AddIcon />}>
            Add task
          </Button>
        }
      />
      <SectionCard
        flush
        title="Tasks"
        actions={
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <FilterChips options={filters} value={filter} onChange={setFilter} ariaLabel="Filter tasks" />
            <SearchInput value={search} onChange={setSearch} placeholder="Search tasks or clients" />
          </Box>
        }
      >
        <DataTable
          columns={baseTaskColumns}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={reload}
          emptyText="No tasks match these filters."
          minWidth={1000}
        />
      </SectionCard>
    </>
  );
}

TasksList.propTypes = { view: PropTypes.oneOf(["mine", "all"]).isRequired };
