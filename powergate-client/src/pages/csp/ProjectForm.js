import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import PageHeader from "components/common/PageHeader";
import SectionCard from "components/common/SectionCard";
import ReturnLink from "components/common/ReturnLink";
import useToast from "hooks/useToast";
import { createCspProject } from "api/powergate";

// Keep in sync with the Creator "Battery Type" dropdown.
const batteryTypes = ["EcoGrid Battery", "Amped Battery", "Lightning"];

const empty = { name: "", customer: "", customerEmail: "", batteryType: "", available: "", threshold: "" };

export default function ProjectForm() {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const errors = {
    name: !form.name.trim() && "Project name is required.",
    customer: !form.customer.trim() && "Customer is required.",
    customerEmail: !/^\S+@\S+\.\S+$/.test(form.customerEmail) && "Enter the client's primary email.",
    batteryType: !form.batteryType && "Choose a battery type.",
    threshold: (form.threshold === "" || Number(form.threshold) < 0) && "Enter the approval threshold in hours.",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const submit = async () => {
    setTouched(true);
    if (hasErrors) return;
    setSaving(true);
    try {
      await createCspProject({
        ...form,
        available: form.available === "" ? null : Number(form.available),
        threshold: Number(form.threshold),
      });
      toast("Project created.");
      navigate("/csp/projects/mine");
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const field = (key, props) => (
    <TextField
      value={form[key]}
      onChange={set(key)}
      error={touched && Boolean(errors[key])}
      helperText={touched && errors[key] ? errors[key] : props.helperText}
      fullWidth
      InputLabelProps={{ shrink: true }}
      {...props}
    />
  );

  return (
    <>
      <ReturnLink to="/csp/projects/mine" label="Back to my projects" />
      <PageHeader eyebrow="PowerGate · CSP" title="Add Project" description="Create a PowerGate project and set its approval threshold." />
      <SectionCard title="Project details">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: "repeat(2, minmax(0,1fr))" }, gap: 2.5 }}>
          {field("name", { label: "Project name", required: true })}
          {field("customer", { label: "Customer", required: true })}
          {field("customerEmail", { label: "Client primary email", required: true, type: "email" })}
          {field("batteryType", {
            label: "Battery type",
            required: true,
            select: true,
            children: batteryTypes.map((b) => (
              <MenuItem key={b} value={b}>{b}</MenuItem>
            )),
          })}
          {field("available", { label: "Starting available hours", type: "number", inputProps: { min: 0, step: 0.5 }, helperText: "Leave blank to use the customer's battery." })}
          {field("threshold", { label: "Approval threshold (hours)", required: true, type: "number", inputProps: { min: 0, step: 0.5 }, helperText: "Tasks at or under this can be approved by the CSP." })}
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, mt: 3, flexWrap: "wrap" }}>
          <Button variant="contained" size="large" onClick={submit} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
            Create project
          </Button>
          <Button variant="outlined" size="large" onClick={() => { setForm(empty); setTouched(false); }} disabled={saving}>
            Reset
          </Button>
        </Box>
      </SectionCard>
    </>
  );
}
