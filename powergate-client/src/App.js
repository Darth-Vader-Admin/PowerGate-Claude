import { Navigate, Route, Routes } from "react-router-dom";
import Button from "@mui/material/Button";
import AppShell from "components/layout/AppShell";
import FullPageMessage from "components/common/FullPageMessage";
import RequireRole from "auth/RequireRole";
import { useAuth } from "auth/AuthContext";
import { homeRouteFor } from "config/navigation";
import SignIn from "pages/auth/SignIn";
import NotFound from "pages/NotFound";
import { clientRoutes, cspRoutes } from "routes";

export default function App() {
  const { status, user, error, reload, signOut } = useAuth();

  if (status === "loading") return <FullPageMessage loading message="Loading PowerGate…" />;

  if (status === "error" && !error) {
    return (
      <FullPageMessage
        title="Something went wrong"
        message="We couldn't load your account."
        action={<Button variant="contained" onClick={reload}>Try again</Button>}
      />
    );
  }

  // Signed in to Catalyst but no PowerGate role / profile, or the API failed.
  if (status === "error") {
    return (
      <FullPageMessage
        title="We couldn't open PowerGate"
        message={error}
        action={
          <>
            <Button variant="contained" onClick={reload}>Try again</Button>
            <Button variant="outlined" onClick={signOut}>Sign out</Button>
          </>
        }
      />
    );
  }

  if (status === "signedOut") {
    return (
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="*" element={<Navigate to="/sign-in" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/sign-in" element={<Navigate to={homeRouteFor(user.role)} replace />} />
      <Route element={<AppShell />}>
        {clientRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={<RequireRole role="client">{r.element}</RequireRole>} />
        ))}
        {cspRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={<RequireRole role="csp">{r.element}</RequireRole>} />
        ))}
        <Route path="/" element={<Navigate to={homeRouteFor(user.role)} replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
