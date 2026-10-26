import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ReturnLink from "components/common/ReturnLink";
import PageHeader from "components/common/PageHeader";
import SectionCard from "components/common/SectionCard";
import DataTable from "components/common/DataTable";
import StatusPill from "components/common/StatusPill";
import useAsync from "hooks/useAsync";
import useToast from "hooks/useToast";
import { getClientRequests, submitClientRequest } from "api/powergate";
import appConfig from "config/app";
import { formatDate, wordCount } from "utils/format";
import tokens from "theme/tokens";

// `value` is what gets stored in Creator's Request_Type field — keep in sync with the Creator dropdown.
const requestTypes = [
  { id: "task", value: "New Task Request", label: "New Task Request" },
  { id: "plan", value: "Change PowerPlan", label: "Change PowerPlan" },
  { id: "trickle", value: "Opt for Trickle Charge", label: "Opt for Trickle Charge" },
  { id: "metered", value: "Opt for Metered Transmission", label: "Opt for Metered Transmission" },
];

const explainers = {
  trickle:
    "Trickle Charge tops up your battery automatically each period at a pace you choose, so implementation capacity never runs dry.",
  metered:
    "Metered Transmission caps how many hours are used in a set period, so work moves at a pace that fits your budget.",
};

const steps = [
  { title: "We receive it", text: "Customer Service is notified as soon as you submit." },
  { title: "We review & estimate", text: "New work gets an hour estimate from your CSP." },
  { title: "You approve", text: "The estimate appears on your dashboard for approval before work starts." },
];

const historyColumns = [
  { key: "type", label: "Request type", strong: true },
  { key: "plan", label: "PowerPlan", muted: true, render: (r) => r.plan || "—" },
  { key: "submittedOn", label: "Submitted", muted: true, num: true, nowrap: true, render: (r) => formatDate(r.submittedOn) },
  { key: "fileCount", label: "Files", muted: true, num: true },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} /> },
];

export default function Requests() {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const initialType = requestTypes.some((t) => t.id === searchParams.get("type"))
    ? searchParams.get("type")
    : "task";

  const [type, setType] = useState(initialType);
  const [description, setDescription] = useState("");
  const [plan, setPlan] = useState("");
  const [consent, setConsent] = useState(false);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);
  const fileInput = useRef(null);
  const history = useAsync(getClientRequests, []);

  const { minDescriptionWords, maxFiles, maxFileSizeMb } = appConfig.request;
  const words = wordCount(description);

  const errors = useMemo(() => {
    const list = {};
    if (type === "task" && words < minDescriptionWords) {
      list.description = `Please describe the work in at least ${minDescriptionWords} words (${words} so far).`;
    }
    if (type === "plan" && !plan) list.plan = "Choose the PowerPlan you want to move to.";
    if (type !== "task" && !consent) list.consent = "Please confirm you agree to enroll.";
    return list;
  }, [type, words, plan, consent, minDescriptionWords]);

  const reset = () => {
    setDescription("");
    setPlan("");
    setConsent(false);
    setFiles([]);
    setTouched(false);
  };

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    const tooBig = incoming.filter((f) => f.size > maxFileSizeMb * 1024 * 1024);
    if (tooBig.length) toast(`${tooBig.map((f) => f.name).join(", ")} is over ${maxFileSizeMb} MB.`, "warning");
    const accepted = incoming.filter((f) => f.size <= maxFileSizeMb * 1024 * 1024);
    const next = [...files, ...accepted].slice(0, maxFiles);
    if (files.length + accepted.length > maxFiles) toast(`You can attach up to ${maxFiles} files.`, "warning");
    setFiles(next);
    if (fileInput.current) fileInput.current.value = "";
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (Object.keys(errors).length) return;
    setSubmitting(true);
    try {
      const selected = requestTypes.find((t) => t.id === type);
      await submitClientRequest({
        type: selected.value,
        description: type === "task" ? description.trim() : "",
        plan: type === "plan" ? plan : "",
        consent: type !== "task" ? consent : false,
        files: type === "task" ? files : [],
      });
      toast("Request submitted. Customer Service has been notified.");
      reset();
      history.reload();
    } catch (error) {
      toast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const typeButton = (t) => {
    const active = t.id === type;
    return (
      <ButtonBase
        key={t.id}
        onClick={() => {
          setType(t.id);
          setTouched(false);
          setConsent(false);
        }}
        aria-pressed={active}
        sx={{
          minHeight: 56,
          px: 1.5,
          py: 1.25,
          borderRadius: "12px",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: tokens.font.body,
          lineHeight: 1.3,
          border: `1px solid ${active ? tokens.color.accent : tokens.color.borderStrong}`,
          bgcolor: active ? tokens.color.accentTint : tokens.color.input,
          color: active ? "#fff" : "#cfcfcf",
        }}
      >
        {t.label}
      </ButtonBase>
    );
  };

  return (
    <>
      <ReturnLink />
      <PageHeader
        title="Requests"
        description="Ask for new work or change how your PowerPlan runs. Our team reviews every request."
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "minmax(0,1.4fr) minmax(0,1fr)" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <SectionCard title="Submit a request">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.75 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Request type</Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", md: "repeat(4, minmax(0,1fr))" },
                  gap: 1.25,
                }}
              >
                {requestTypes.map(typeButton)}
              </Box>
            </Box>

            {type === "task" && (
              <>
                <TextField
                  label="Description"
                  placeholder={`Describe what you need, why, and any deadline (minimum ${minDescriptionWords} words).`}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  multiline
                  minRows={6}
                  fullWidth
                  error={touched && Boolean(errors.description)}
                  helperText={touched && errors.description ? errors.description : `${words} words`}
                  InputLabelProps={{ shrink: true }}
                />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Supporting video / images</Typography>
                  <ButtonBase
                    component="label"
                    sx={{
                      minHeight: 96,
                      borderRadius: "12px",
                      border: "1px dashed #444",
                      bgcolor: tokens.color.input,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.75,
                      color: tokens.color.textDim,
                      fontSize: 14,
                    }}
                  >
                    <FileUploadOutlinedIcon />
                    Click to upload · up to {maxFiles} files, {maxFileSizeMb} MB each
                    <input
                      ref={fileInput}
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf"
                      hidden
                      onChange={(event) => addFiles(event.target.files)}
                    />
                  </ButtonBase>
                  {files.map((file, index) => (
                    <Box
                      key={`${file.name}-${index}`}
                      sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1.5, py: 0.75, borderRadius: "10px", bgcolor: tokens.color.input, border: `1px solid ${tokens.color.border}` }}
                    >
                      <Typography sx={{ fontSize: 14, wordBreak: "break-all" }}>{file.name}</Typography>
                      <IconButton
                        size="small"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => setFiles(files.filter((_, i) => i !== index))}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </>
            )}

            {type === "plan" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Choose a PowerPlan</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(3, minmax(0,1fr))" }, gap: 1.25 }}>
                  {appConfig.powerPlans.map((p) => {
                    const active = plan === p.id;
                    return (
                      <ButtonBase
                        key={p.id}
                        onClick={() => setPlan(p.id)}
                        aria-pressed={active}
                        sx={{
                          p: 2,
                          borderRadius: "12px",
                          border: `1px solid ${active ? tokens.color.accent : tokens.color.borderStrong}`,
                          bgcolor: active ? "#1a0a0c" : tokens.color.input,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 0.75,
                          color: tokens.color.text,
                          fontFamily: tokens.font.body,
                        }}
                      >
                        <Typography sx={{ fontWeight: 700 }}>{p.label}</Typography>
                        <Typography sx={{ fontSize: 13, color: tokens.color.textMuted }}>{p.note}</Typography>
                      </ButtonBase>
                    );
                  })}
                </Box>
                {touched && errors.plan && <Typography sx={{ fontSize: 13, color: tokens.pill.error.fg }}>{errors.plan}</Typography>}
              </Box>
            )}

            {explainers[type] && (
              <Typography sx={{ p: 2, borderRadius: "12px", bgcolor: tokens.color.input, border: `1px solid ${tokens.color.border}`, fontSize: 15, lineHeight: 1.7, color: "#cfcfcf" }}>
                {explainers[type]}
              </Typography>
            )}

            {type !== "task" && (
              <Box>
                <FormControlLabel
                  control={<Checkbox checked={consent} onChange={(event) => setConsent(event.target.checked)} sx={{ color: tokens.color.textMuted, "&.Mui-checked": { color: tokens.color.accent } }} />}
                  label="I have read and understood the information provided and agree to enroll in this service."
                  sx={{ alignItems: "flex-start", "& .MuiFormControlLabel-label": { fontSize: 14, lineHeight: 1.6, color: "#cfcfcf", pt: 1 } }}
                />
                {touched && errors.consent && <Typography sx={{ fontSize: 13, color: tokens.pill.error.fg }}>{errors.consent}</Typography>}
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
              >
                Submit request
              </Button>
              <Button variant="outlined" size="large" onClick={reset} disabled={submitting}>
                Reset
              </Button>
            </Box>
          </Box>
        </SectionCard>

        <SectionCard title="What happens next">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            {steps.map((step, index) => (
              <Box key={step.title} sx={{ display: "flex", gap: 1.75 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: 999, bgcolor: tokens.color.accent, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {index + 1}
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Typography sx={{ fontWeight: 700 }}>{step.title}</Typography>
                  <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: tokens.color.textMuted }}>{step.text}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Box>

      <SectionCard flush title="My requests">
        <DataTable
          columns={historyColumns}
          rows={history.data || []}
          loading={history.loading}
          error={history.error}
          onRetry={history.reload}
          emptyText="You haven't submitted any requests yet."
        />
      </SectionCard>
    </>
  );
}
