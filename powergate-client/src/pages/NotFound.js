import { Link as RouterLink } from "react-router-dom";
import Button from "@mui/material/Button";
import PageHeader from "components/common/PageHeader";
import { useAuth } from "auth/AuthContext";
import { homeRouteFor } from "config/navigation";

export default function NotFound() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Page not found" description="That link doesn't match a PowerGate page." />
      <Button component={RouterLink} to={homeRouteFor(user && user.role)} variant="contained" sx={{ alignSelf: "flex-start" }}>
        Go to my dashboard
      </Button>
    </>
  );
}
