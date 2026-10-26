import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useAuth } from "auth/AuthContext";
import { homeRouteFor } from "config/navigation";

// UI-level guard only. The backend enforces the same role on every endpoint.
export default function RequireRole({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/sign-in" replace />;
  if (user.role !== role) return <Navigate to={homeRouteFor(user.role)} replace />;
  return children;
}

RequireRole.propTypes = {
  role: PropTypes.oneOf(["client", "csp"]).isRequired,
  children: PropTypes.node.isRequired,
};
