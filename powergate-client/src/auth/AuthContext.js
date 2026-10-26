import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import appConfig from "config/app";
import { getMe, setMockRole, resetMockData } from "api/powergate";
import { hasCatalystSession, catalystSignOut } from "auth/catalystAuth";

const AuthContext = createContext(null);

// status: "loading" | "signedOut" | "signedIn" | "error"
export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: "loading", user: null, error: null });

  const loadUser = useCallback(async () => {
    setState({ status: "loading", user: null, error: null });
    try {
      if (!appConfig.useMock) {
        const hasSession = await hasCatalystSession();
        if (!hasSession) {
          setState({ status: "signedOut", user: null, error: null });
          return;
        }
      } else if (!sessionStorage.getItem("pg-mock-role")) {
        setState({ status: "signedOut", user: null, error: null });
        return;
      } else {
        setMockRole(sessionStorage.getItem("pg-mock-role"));
      }

      // Role comes from the server (Catalyst user role), never from the browser.
      const user = await getMe();
      if (!user || !["client", "csp"].includes(user.role)) {
        setState({
          status: "error",
          user: null,
          error: "Your account doesn't have PowerGate access yet. Contact customer service.",
        });
        return;
      }
      setState({ status: "signedIn", user, error: null });
    } catch (error) {
      if (error.status === 401) {
        setState({ status: "signedOut", user: null, error: null });
      } else {
        setState({ status: "error", user: null, error: error.message });
      }
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const mockSignIn = useCallback(
    (role) => {
      sessionStorage.setItem("pg-mock-role", role);
      resetMockData();
      loadUser();
    },
    [loadUser]
  );

  const signOut = useCallback(() => {
    if (appConfig.useMock) {
      sessionStorage.removeItem("pg-mock-role");
      setState({ status: "signedOut", user: null, error: null });
      return;
    }
    catalystSignOut();
  }, []);

  const value = useMemo(
    () => ({ ...state, reload: loadUser, signOut, mockSignIn }),
    [state, loadUser, signOut, mockSignIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
