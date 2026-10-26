import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Outlet, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Header from "components/layout/Header";
import { useAuth } from "auth/AuthContext";
import { clientMenu, cspMenu } from "config/navigation";
import { getClientSummary, getCspSummary } from "api/powergate";
import tokens from "theme/tokens";

// Website-style shell: enclosed sticky header with the menu, full-width dark content panel below.
export default function AppShell({ maxWidth }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [badge, setBadge] = useState(0);
  const isCsp = user && user.role === "csp";
  const menu = isCsp ? cspMenu : clientMenu;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Bell badge = items waiting on this user. Refreshes on navigation; failures are non-blocking.
  useEffect(() => {
    let active = true;
    const load = isCsp ? getCspSummary : getClientSummary;
    load()
      .then((summary) => {
        if (active) setBadge(isCsp ? summary.needsAction || 0 : summary.awaiting || 0);
      })
      .catch(() => {
        if (active) setBadge(0);
      });
    return () => {
      active = false;
    };
  }, [isCsp, pathname]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: tokens.color.pageBg, fontFamily: tokens.font.body }}>
      <Box sx={{ maxWidth, mx: "auto", px: { xs: 1, md: 3 }, pt: { xs: 1, md: 2 }, pb: 4, display: "flex", flexDirection: "column", gap: { xs: 1.5, md: 2.5 } }}>
        <Header menu={menu} notificationCount={badge} />

        <Box
          component="main"
          sx={{
            bgcolor: tokens.color.panel,
            color: tokens.color.text,
            borderRadius: `${tokens.radius.xxl}px`,
            px: { xs: 2, md: 5 },
            pt: { xs: 3, md: 4.5 },
            pb: { xs: 6, md: 9 },
            display: "flex",
            flexDirection: "column",
            gap: 3.5,
            minWidth: 0,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

AppShell.propTypes = { maxWidth: PropTypes.number };
AppShell.defaultProps = { maxWidth: 1440 };
