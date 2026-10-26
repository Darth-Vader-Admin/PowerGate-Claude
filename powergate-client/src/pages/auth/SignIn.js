import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckIcon from "@mui/icons-material/Check";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import { useAuth } from "auth/AuthContext";
import { renderCatalystLogin } from "auth/catalystAuth";
import { homeRouteFor } from "config/navigation";
import appConfig from "config/app";
import tokens from "theme/tokens";

const features = [
  { icon: CheckIcon, text: "Approve or reject task estimates in one click" },
  { icon: BatteryChargingFullIcon, text: "See used, committed and available hours" },
  { icon: NoteAddOutlinedIcon, text: "Submit new tasks and PowerPlan changes" },
];

function MockSignIn() {
  const { mockSignIn } = useAuth();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography sx={{ fontSize: 14, color: tokens.color.textMuted }}>
        Mock mode — pick a user type to preview the portal with sample data.
      </Typography>
      <Button variant="contained" size="large" onClick={() => mockSignIn("client")}>
        Sign in as Client
      </Button>
      <Button variant="outlined" size="large" onClick={() => mockSignIn("csp")}>
        Sign in as CSP
      </Button>
    </Box>
  );
}

function CatalystSignIn() {
  const [sdkMissing, setSdkMissing] = useState(false);

  useEffect(() => {
    // The SDK script loads async from the CDN; retry briefly before giving up.
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (renderCatalystLogin()) {
        clearInterval(timer);
      } else if (attempts > 20) {
        clearInterval(timer);
        setSdkMissing(true);
      }
    }, 150);
    return () => clearInterval(timer);
  }, []);

  if (sdkMissing) {
    return (
      <Typography sx={{ color: tokens.pill.error.fg }}>
        Sign-in couldn&apos;t load. Refresh the page, or contact {appConfig.supportEmail}.
      </Typography>
    );
  }

  // Catalyst renders its embedded login iframe into this element.
  return <Box id={appConfig.loginElementId} sx={{ minHeight: 420, "& iframe": { width: "100%", border: 0 } }} />;
}

export default function SignIn() {
  const { status, user, error } = useAuth();

  if (status === "signedIn" && user) return <Navigate to={homeRouteFor(user.role)} replace />;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0,1fr)", md: "repeat(2, minmax(0,1fr))" },
        bgcolor: tokens.color.panel,
        color: tokens.color.text,
      }}
    >
      <Box
        sx={{
          px: { xs: 3, md: 9 },
          py: { xs: 5, md: 7 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 6,
          bgcolor: tokens.color.panelDeep,
          order: { xs: 2, md: 1 },
          borderRight: { md: `1px solid ${tokens.color.borderMuted}` },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              bgcolor: tokens.color.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BoltIcon />
          </Box>
          <Typography sx={{ fontFamily: tokens.font.heading, fontSize: 24, fontWeight: 700 }}>
            {appConfig.appName}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, maxWidth: 520 }}>
          <Box
            sx={{
              alignSelf: "flex-start",
              px: 2,
              py: 1,
              borderRadius: 999,
              border: "1px solid #5a1a20",
              bgcolor: "#1a0a0c",
              color: "#ffb3b3",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {appConfig.tagline}
          </Box>
          <Typography
            component="h1"
            sx={{
              fontFamily: tokens.font.heading,
              fontSize: { xs: 40, md: 56 },
              lineHeight: 1.05,
              fontWeight: 800,
            }}
          >
            Approve work before it starts.
          </Typography>
          <Typography sx={{ fontSize: 18, lineHeight: 1.7, color: tokens.color.textDim }}>
            Review estimates, track your PowerPlan battery and send requests to BMI — all from one
            secure portal.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {features.map(({ icon: Icon, text }) => (
              <Box key={text} sx={{ display: "flex", alignItems: "center", gap: 1.75, fontSize: 16 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: tokens.color.accentSoft,
                    color: tokens.color.link,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 18 }} />
                </Box>
                {text}
              </Box>
            ))}
          </Box>
        </Box>

        <Typography sx={{ fontSize: 13, color: tokens.color.textSubtle }}>
          {appConfig.companyLine}
        </Typography>
      </Box>

      <Box
        sx={{
          px: { xs: 2, md: 9 },
          py: { xs: 4, md: 7 },
          order: { xs: 1, md: 2 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 3.5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            <Typography component="h2" sx={{ fontFamily: tokens.font.heading, fontSize: 34, fontWeight: 700 }}>
              Sign in
            </Typography>
            <Typography sx={{ fontSize: 15, lineHeight: 1.6, color: tokens.color.textMuted }}>
              Use the email address your PowerGate invitation was sent to.
            </Typography>
          </Box>

          {status === "error" && error && (
            <Box
              role="alert"
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: tokens.pill.error.bg,
                color: tokens.pill.error.fg,
                fontWeight: 700,
              }}
            >
              {error}
            </Box>
          )}

          <Box
            sx={{
              bgcolor: tokens.color.card,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: "20px",
              p: 4,
            }}
          >
            {appConfig.useMock ? <MockSignIn /> : <CatalystSignIn />}
          </Box>

          <Box
            sx={{
              px: 2.5,
              py: 2.25,
              borderRadius: "14px",
              border: `1px solid ${tokens.color.border}`,
              fontSize: 14,
              lineHeight: 1.6,
              color: tokens.color.textDim,
            }}
          >
            Access is by invitation only. Need an account or help signing in? Contact{" "}
            <Link href={`mailto:${appConfig.supportEmail}`} sx={{ color: tokens.color.link }}>
              {appConfig.supportEmail}
            </Link>
          </Box>

          <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", fontSize: 14 }}>
            <Link href={appConfig.termsUrl} target="_blank" rel="noopener noreferrer" sx={{ color: tokens.color.link }}>
              Terms &amp; Conditions
            </Link>
            <Link href={appConfig.userGuideUrl} target="_blank" rel="noopener noreferrer" sx={{ color: tokens.color.link }}>
              PowerGate user guide
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
