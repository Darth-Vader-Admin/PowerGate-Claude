import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import PageHeader from "components/common/PageHeader";
import SectionCard from "components/common/SectionCard";
import ReturnLink from "components/common/ReturnLink";
import useAsync from "hooks/useAsync";
import useToast from "hooks/useToast";
import { useAuth } from "auth/AuthContext";
import { createCspTask, getCspProjects } from "api/powergate";
import { formatHours } from "utils/format";
import tokens from "theme/tokens";

export default function TaskForm() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const projects = useAsync(() => getCspProjects("mine"), []);
  const [form, setForm] = useState({ name: "", projectId: "", estimateHours: "", description: "", requestedBy: "" });
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const project = (projects.data || []).find((p) => p.id === form.projectId);
  const errors = {
    name: !form.name.trim() && "Task name is required.",
    projectId: !form.projectId && "Choose a project.",
    estimateHours: !(Number(form.estimateHours) > 0) && "Enter an estimate greater than 0.",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const submit = async () => {
    setTouched(true);
    if (hasErrors) return;
    setSaving(true);
    try {
      await createCspTask({
        ...form,
        estimateHours: Number(form.estimateHours),
        requestedBy: form.requestedBy.trim() || (user && user.email),
      });
      toast("Task added. It's in your pending list, ready to send for approval.");
      navigate("/csp/approvals");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ReturnLink to="/csp/approvals" label="Back to approval screen" />
      <PageHeader eyebrow="PowerGate · CSP" title="Add Task" description="Log a task estimate. It lands in your pending list until you send it or decide it." />
      <SectionCard title="Task details">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: "repeat(2, minmax(0,1fr))" }, gap: 2.5 }}>
          <TextField label="Task name" required value={form.name} onChange={set("name")} error={touched && Boolean(errors.name)} helperText={touched && errors.name} InputLabelProps={{ shrink: true }} />
          <TextField
            select
            label="Project"
            required
            value={form.projectId}
            onChange={set("projectId")}
            error={touched && Boolean(errors.projectId)}
            helperText={(touched && errors.projectId) || (projects.error ? projects.error.message : "")}
            InputLabelProps={{ shrink: true }}
            disabled={projects.loading}
          >
            {(projects.data || []).map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.name} · {p.customer}</MenuItem>
            ))}
          </TextField>
          <TextField label="Estimate (hours)" required type="number" inputProps={{ min: 0.25, step: 0.25 }} value={form.estimateHours} onChange={set("estimateHours")} error={touched && Boolean(errors.estimateHours)} helperText={touched && errors.estimateHours} InputLabelProps={{ shrink: true }} />
          <TextField label="Requested by (email)" placeholder={user ? user.email : ""} value={form.requestedBy} onChange={set("requestedBy")} InputLabelProps={{ shrink: true }} helperText="Leave blank to use your email." />
          <TextField label="Description" multiline minRows={5} value={form.description} onChange={set("description")} InputLabelProps={{ shrink: true }} sx={{ gridColumn: { md: "1 / -1" } }} />
        </Box>
        {project && (
          <Typography sx={{ mt: 2.5, fontSize: 14, color: tokens.color.textMuted }}>
            {project.customer} has {formatHours(project.available)} available · approval threshold {formatHours(project.threshold)}.
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
          <Button variant="contained" size="large" onClick={submit} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
            Add task
          </Button>
        </Box>
      </SectionCard>
    </>
  );
}
