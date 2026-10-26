import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import BoltIcon from "@mui/icons-material/Bolt";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ReturnLink from "components/common/ReturnLink";
import SectionCard from "components/common/SectionCard";
import StatusPill from "components/common/StatusPill";
import BatteryBar from "components/common/BatteryBar";
import useAsync from "hooks/useAsync";
import { useAuth } from "auth/AuthContext";
import { getClientProfile } from "api/powergate";
import { formatHours, formatHoursMinutes, initialsFrom, percent } from "utils/format";
import tokens from "theme/tokens";

function Fact({ label, value }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 0 }}>
      <Typography sx={{ fontSize: 13, color: tokens.color.textMuted }}>{label}</Typography>
      <Typography className="num" sx={{ fontSize: 17, fontWeight: 700, wordBreak: "break-word" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

function Legend({ color, label, hours, max }) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.75,
        borderRadius: "12px",
        bgcolor: tokens.color.input,
        border: `1px solid ${tokens.color.border}`,
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: 13, color: tokens.color.textMuted }}>
        <Box sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: color }} />
        {label}
      </Box>
      <Typography className="num" sx={{ fontSize: 18, fontWeight: 700 }}>
        {formatHours(hours)} · {percent(hours, max)}%
      </Typography>
    </Box>
  );
}

const twoCols = { display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "repeat(2, minmax(0,1fr))" }, gap: 2.5 };

export default function MyProfile() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(getClientProfile, []);
  const battery = data && data.battery;

  if (error) {
    return (
      <>
        <ReturnLink />
        <SectionCard title="Couldn't load your profile">
          <Typography sx={{ color: tokens.color.textMuted, mb: 2 }}>{error.message}</Typography>
          <Button variant="outlined" onClick={reload}>Try again</Button>
        </SectionCard>
      </>
    );
  }

  return (
    <>
      <ReturnLink />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 3, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "20px",
              bgcolor: tokens.color.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: tokens.font.heading,
              fontSize: 28,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initialsFrom((data && data.customerName) || (user && user.name))}
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 0 }}>
            <Typography variant="h1" sx={{ fontSize: { xs: 30, md: 40 } }}>
              {loading ? <Skeleton width={260} sx={{ bgcolor: "#262626" }} /> : data.customerName}
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", fontSize: 15, color: tokens.color.textMuted }}>
              <span>{data ? data.primaryEmail : user && user.email}</span>
              {data && <StatusPill label={data.status} />}
            </Box>
          </Box>
        </Box>
        <Button
          component={RouterLink}
          to="/client/requests?type=plan"
          variant="contained"
          size="large"
          startIcon={<BoltIcon />}
        >
          Change PowerPlan
        </Button>
      </Box>

      <Box sx={twoCols}>
        <SectionCard title="Account details">
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "22px 24px" }}>
            <Fact label="Customer name" value={data && data.customerName} />
            <Fact label="Primary contact" value={data && data.primaryEmail} />
            <Fact label="PowerPlan" value={data && data.powerPlan} />
            <Fact label="Account status" value={data && data.status} />
            <Fact label="Battery max" value={battery && formatHours(battery.max)} />
            <Fact label="Battery current" value={battery && formatHours(Number(battery.max) - Number(battery.used))} />
          </Box>
        </SectionCard>

        <SectionCard
          title="Battery usage"
          actions={battery && <Typography className="num" sx={{ fontSize: 15, color: tokens.color.textMuted }}>of {formatHours(battery.max)}</Typography>}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.75 }}>
            <Typography className="num" sx={{ fontFamily: tokens.font.heading, fontSize: { xs: 36, md: 48 }, fontWeight: 700 }}>
              {battery ? formatHoursMinutes(battery.available) : "—"}{" "}
              <Box component="span" sx={{ fontSize: 18, fontWeight: 500, color: tokens.color.textMuted }}>
                available
              </Box>
            </Typography>
            <BatteryBar battery={battery} height={18} showLegend={false} />
            {battery && (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(3, minmax(0,1fr))" }, gap: 1.5 }}>
                <Legend color={tokens.battery.used} label="Used" hours={battery.used} max={battery.max} />
                <Legend color={tokens.battery.committed} label="Committed" hours={battery.committed} max={battery.max} />
                <Legend color={tokens.battery.available} label="Available" hours={battery.available} max={battery.max} />
              </Box>
            )}
            <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: tokens.color.textMuted }}>
              Committed hours are approved tasks that are not yet closed.
            </Typography>
          </Box>
        </SectionCard>
      </Box>

      <Box sx={twoCols}>
        <SectionCard title="Authorized users" subtitle="People on your account who can review and approve work.">
          {(data ? data.users : []).map((u) => (
            <Box
              key={u.email}
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, py: 1.75, borderTop: `1px solid ${tokens.color.borderMuted}` }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: tokens.color.accentSoft, color: tokens.color.link, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <PersonOutlineIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontSize: 15, wordBreak: "break-all" }}>{u.email}</Typography>
              </Box>
              <Typography sx={{ fontSize: 13, color: tokens.color.textMuted, flexShrink: 0 }}>{u.role}</Typography>
            </Box>
          ))}
          {data && data.users.length === 0 && (
            <Typography sx={{ color: tokens.color.textMuted }}>No authorized users on file.</Typography>
          )}
        </SectionCard>

        <SectionCard title="Projects & your BMI contact" subtitle="Your Customer Success contact for each active project.">
          {(data ? data.projects : []).map((p) => (
            <Box
              key={`${p.name}-${p.cspEmail}`}
              sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, py: 1.75, borderTop: `1px solid ${tokens.color.borderMuted}`, flexWrap: "wrap" }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{p.name}</Typography>
                <Typography sx={{ fontSize: 14, color: tokens.color.textMuted, wordBreak: "break-all" }}>CSP · {p.cspEmail || "—"}</Typography>
              </Box>
              <StatusPill label={p.status} />
            </Box>
          ))}
          {data && data.projects.length === 0 && (
            <Typography sx={{ color: tokens.color.textMuted }}>No active projects.</Typography>
          )}
        </SectionCard>
      </Box>
    </>
  );
}
