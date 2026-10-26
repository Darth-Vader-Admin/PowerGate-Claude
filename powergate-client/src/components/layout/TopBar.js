import { useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "auth/AuthContext";
import { initialsFrom } from "utils/format";
import tokens from "theme/tokens";

const SIDEBAR_OFFSET = { md: "348px" };

export default function TopBar({ onOpenMenu, notificationCount }) {
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const isCsp = user && user.role === "csp";

  return (
    <Box
      component="header"
      sx={{
        width: "100%",
        minHeight: 88,
        bgcolor: tokens.color.shellBlack,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        pr: 3,
        pl: { xs: 2, ...SIDEBAR_OFFSET },
        color: "#ffffff",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "stretch", gap: 1 }}>
        <IconButton
          onClick={onOpenMenu}
          aria-label="Open menu"
          sx={{ display: { xs: "inline-flex", md: "none" }, alignSelf: "center", color: "#fff" }}
        >
          <MenuIcon />
        </IconButton>
        <Box
          sx={{
            minHeight: 88,
            px: { xs: 2, sm: 3.5 },
            borderRadius: "0 0 14px 14px",
            bgcolor: tokens.color.accent,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            fontSize: { xs: 16, sm: 19 },
            fontWeight: 700,
          }}
        >
          <RocketLaunchOutlinedIcon sx={{ fontSize: 22 }} />
          {isCsp ? "CSP Tab" : "Customer Tab"}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minHeight: 88 }}>
        <IconButton
          aria-label={
            notificationCount ? `${notificationCount} items need your attention` : "Notifications"
          }
          sx={{ width: 48, height: 48, borderRadius: "12px", bgcolor: "#262626", color: "#fff", position: "relative", "&:hover": { bgcolor: "#333" } }}
        >
          <NotificationsNoneIcon />
          {notificationCount > 0 && (
            <Box
              component="span"
              className="num"
              sx={{
                position: "absolute",
                top: 6,
                right: 6,
                minWidth: 18,
                height: 18,
                px: 0.5,
                borderRadius: 999,
                bgcolor: tokens.color.accent,
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {notificationCount}
            </Box>
          )}
        </IconButton>
        <ButtonBase
          aria-label="Account menu"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{
            width: 48,
            height: 48,
            borderRadius: 999,
            border: "2px solid #3f3f3f",
            bgcolor: "#1f1f1f",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            fontFamily: tokens.font.body,
          }}
        >
          {initialsFrom(user && (user.name || user.email))}
        </ButtonBase>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Box sx={{ px: 2, py: 1.25, maxWidth: 280 }}>
            <Typography sx={{ fontWeight: 700 }}>{user && user.name}</Typography>
            <Typography sx={{ fontSize: 13, color: tokens.color.textMuted, wordBreak: "break-all" }}>
              {user && user.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              signOut();
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}

TopBar.propTypes = {
  onOpenMenu: PropTypes.func.isRequired,
  notificationCount: PropTypes.number,
};

TopBar.defaultProps = { notificationCount: 0 };
