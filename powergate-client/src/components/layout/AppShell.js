import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Outlet, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import TopBar from "components/layout/TopBar";
import Sidebar from "components/layout/Sidebar";
import { useAuth } from "auth/AuthContext";
import { clientMenu, cspMenu } from "config/navigation";
import { getClientSummary, getCspSummary } from "api/powergate";
import tokens from "theme/tokens";

// Shared Creator-style shell: black top bar, white sidebar card overlapping it, dark main panel.
export default function AppShell({ maxWidth }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
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
      <TopBar onOpenMenu={() => setDrawerOpen(true)} notificationCount={badge} />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 300, bgcolor: "transparent", boxShadow: "none", p: 1.5 } }}
        sx={{ display: { md: "none" } }}
      >
        <Sidebar menu={menu} onNavigate={() => setDrawerOpen(false)} />
      </Drawer>

      <Box sx={{ display: "flex", gap: 3, px: { xs: 1.5, sm: 3 }, pb: 4, alignItems: "flex-start" }}>
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            flex: "0 0 300px",
            width: 300,
            mt: "-64px",
            position: "sticky",
            top: 16,
            zIndex: 1,
          }}
        >
          <Sidebar menu={menu} />
        </Box>

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            mt: 3,
            bgcolor: tokens.color.panel,
            color: tokens.color.text,
            borderRadius: `${tokens.radius.xxl}px`,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              maxWidth,
              mx: "auto",
              px: { xs: 2, md: 5 },
              pt: { xs: 3, md: 4 },
              pb: { xs: 6, md: 9 },
              display: "flex",
              flexDirection: "column",
              gap: 3.5,
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

AppShell.propTypes = { maxWidth: PropTypes.number };
AppShell.defaultProps = { maxWidth: 1360 };
