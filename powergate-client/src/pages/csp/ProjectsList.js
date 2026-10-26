import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import PageHeader from "components/common/PageHeader";
import SectionCard from "components/common/SectionCard";
import DataTable from "components/common/DataTable";
import StatusPill from "components/common/StatusPill";
import SearchInput from "components/common/SearchInput";
import useAsync from "hooks/useAsync";
import { batteryCell } from "pages/csp/cspColumns";
import { getCspProjects } from "api/powergate";
import { formatHours } from "utils/format";

export default function ProjectsList({ scope }) {
  const { data, loading, error, reload } = useAsync(() => getCspProjects(scope), [scope]);
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data || []).filter((p) => !term || `${p.name} ${p.customer} ${p.cspEmail}`.toLowerCase().includes(term));
  }, [data, search]);

  const columns = [
    { key: "name", label: "Project", strong: true },
    { key: "customer", label: "Customer", muted: true },
    ...(scope === "all" ? [{ key: "cspEmail", label: "CSP", muted: true }] : []),
    { key: "batteryType", label: "Battery type", muted: true },
    { key: "available", label: "Available", render: (p) => batteryCell(p.available, p.threshold) },
    { key: "threshold", label: "Approval threshold", muted: true, num: true, render: (p) => formatHours(p.threshold) },
    { key: "status", label: "Status", render: (p) => <StatusPill label={p.status} /> },
  ];

  return (
    <>
      <PageHeader
        eyebrow="PowerGate · CSP"
        title={scope === "all" ? "All Projects" : "My Projects"}
        description={scope === "all" ? "Every PowerGate project across all CSPs." : "Projects where you are the Customer Success contact."}
        actions={
          <Button component={RouterLink} to="/csp/projects/new" variant="contained" size="large" startIcon={<AddIcon />}>
            Add project
          </Button>
        }
      />
      <SectionCard flush title="Projects" actions={<SearchInput value={search} onChange={setSearch} placeholder="Search projects" />}>
        <DataTable columns={columns} rows={rows} loading={loading} error={error} onRetry={reload} emptyText="No projects found." />
      </SectionCard>
    </>
  );
}

ProjectsList.propTypes = { scope: PropTypes.oneOf(["mine", "all"]).isRequired };
