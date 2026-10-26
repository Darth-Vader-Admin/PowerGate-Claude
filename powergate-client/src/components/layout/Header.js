import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link as RouterLink, NavLink, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Collapse from "@mui/material/Collapse";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "auth/AuthContext";
import { homeRouteFor } from "config/navigation";
import brand from "config/brand";
import appConfig from "config/app";
import { initialsFrom } from "utils/format";
import tokens from "theme/tokens";

const linkSx = {
  height: 40,
  px: 1.75,
  borderRadius: "10px",
  display: "inline-flex",
  alignItems: "center",
  gap: 0.5,
  fontFamily: tokens.font.body,
  fontSize: 15,
  fontWeight: 700,
  color: tokens.color.textMuted,
  textDecoration: "none",
  whiteSpace: "nowrap",
  "&:hover": { color: tokens.color.text, bgcolor: "rgba(255,255,255,0.06)" },
  "&.active": { color: "#ffffff", bgcolor: tokens.color.accent },
  "&:focus-visible": { outline: `2px solid ${tokens.color.link}`, outlineOffset: 2 },
};

function Brand({ to }) {
  return (
    <Box
      component={RouterLink}
      to={to}
      sx={{ display: "flex", alignItems: "center", gap: 1.25, textDecoration: "none", color: tokens.color.text, flexShrink: 0 }}
    >
      {brand.logo ? (
        <Box component="img" src={brand.logo} alt="" sx={{ width: 36, height: 36, objectFit: "contain", borderRadius: "8px" }} />
      ) : (
        <Box
          aria-hidden="true"
          sx={{
            width: 36,
            height: 36,
            borderRadius: "8px",
            bgcolor: "#ffffff",
            color: tokens.color.brandMark,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 17,
          }}
        >
          {brand.markText}
        </Box>
      )}
      <Typography sx={{ fontFamily: tokens.font.heading, fontSize: 20, fontWeight: 700 }}>
        {appConfig.appName}
      </Typography>
    </Box>
  );
}

Brand.propTypes = { to: PropTypes.string.isRequired };

// Dropdown group (CSP "Projects" / "Tasks"). Highlighted when any child route is active.
function NavGroup({ item }) {
  const { pathname } = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const active = item.children.some((c) => pathname.startsWith(c.path));
  return (
    <>
      <ButtonBase
        className={active ? "active" : undefined}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={linkSx}
      >
        {item.label}
        <ExpandMoreIcon sx={{ fontSize: 18 }} />
      </ButtonBase>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{ sx: { mt: 1, minWidth: 200 } }}
      >
        {item.children.map((child) => (
          <MenuItem
            key={child.key}
            component={RouterLink}
            to={child.path}
            selected={pathname === child.path}
            onClick={() => setAnchorEl(null)}
          >
            {child.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

NavGroup.propTypes = { item: PropTypes.object.isRequired };

function DesktopNav({ menu }) {
  return (
    <Box component="ul" sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", gap: 0.5, listStyle: "none", m: 0, p: 0 }}>
      {menu.map((item) => (
        <Box component="li" key={item.key}>
          {item.children && <NavGroup item={item} />}
          {item.href && (
            <ButtonBase component="a" href={item.href} target="_blank" rel="noopener noreferrer" sx={linkSx}>
              {item.label}
            </ButtonBase>
          )}
          {item.path && (
            <ButtonBase component={NavLink} to={item.path} end sx={linkSx}>
              {item.label}
            </ButtonBase>
          )}
        </Box>
      ))}
    </Box>
  );
}

DesktopNav.propTypes = { menu: PropTypes.array.isRequired };

// Below lg the nav folds into a panel inside the same enclosed header (no side drawer).
function MobileNav({ menu, open }) {
  const flat = menu.flatMap((item) =>
    item.children ? [{ key: `${item.key}-label`, groupLabel: item.label }, ...item.children] : [item]
  );
  return (
    <Collapse in={open} sx={{ display: { lg: "none" } }}>
      <Box component="nav" aria-label="Main menu" sx={{ borderTop: `1px solid ${tokens.color.border}`, mt: 1.5, pt: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
        {flat.map((item) => {
          if (item.groupLabel) {
            return (
              <Typography key={item.key} sx={{ px: 1.75, pt: 1.5, pb: 0.5, fontSize: 13, color: tokens.color.textSubtle }}>
                {item.groupLabel}
              </Typography>
            );
          }
          if (item.href) {
            return (
              <ButtonBase key={item.key} component="a" href={item.href} target="_blank" rel="noopener noreferrer" sx={{ ...linkSx, justifyContent: "flex-start", height: 44 }}>
                {item.label}
              </ButtonBase>
            );
          }
          return (
            <ButtonBase key={item.key} component={NavLink} to={item.path} end sx={{ ...linkSx, justifyContent: "flex-start", height: 44 }}>
              {item.label}
            </ButtonBase>
          );
        })}
      </Box>
    </Collapse>
  );
}

MobileNav.propTypes = { menu: PropTypes.array.isRequired, open: PropTypes.bool.isRequired };

export default function Header({ menu, notificationCount }) {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const [accountEl, setAccountEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: { xs: 8, md: 16 },
        zIndex: 10,
        bgcolor: tokens.color.shellBlack,
        border: `1px solid ${tokens.color.borderMuted}`,
        borderRadius: `${tokens.radius.xl}px`,
        boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
        px: { xs: 1.5, md: 2.5 },
        py: 1.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, lg: 4 }, minWidth: 0 }}>
          <IconButton
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            sx={{ display: { lg: "none" }, color: "#fff" }}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Brand to={homeRouteFor(user && user.role)} />
          <Box component="nav" aria-label="Main menu" sx={{ display: { xs: "none", lg: "block" } }}>
            <DesktopNav menu={menu} />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            aria-label={notificationCount ? `${notificationCount} items need your attention` : "Notifications"}
            sx={{ width: 42, height: 42, borderRadius: "10px", bgcolor: "#1f1f1f", color: "#fff", position: "relative", "&:hover": { bgcolor: "#2a2a2a" } }}
          >
            <NotificationsNoneIcon sx={{ fontSize: 22 }} />
            {notificationCount > 0 && (
              <Box
                component="span"
                className="num"
                sx={{ position: "absolute", top: 4, right: 4, minWidth: 18, height: 18, px: 0.5, borderRadius: 999, bgcolor: tokens.color.accent, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {notificationCount}
              </Box>
            )}
          </IconButton>
          <ButtonBase
            aria-label="Account menu"
            onClick={(event) => setAccountEl(event.currentTarget)}
            sx={{ width: 42, height: 42, borderRadius: 999, border: "2px solid #3f3f3f", bgcolor: "#1f1f1f", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: tokens.font.body }}
          >
            {initialsFrom(user && (user.name || user.email))}
          </ButtonBase>
          <Menu
            anchorEl={accountEl}
            open={Boolean(accountEl)}
            onClose={() => setAccountEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{ sx: { mt: 1 } }}
          >
            <Box sx={{ px: 2, py: 1.25, maxWidth: 280 }}>
              <Typography sx={{ fontWeight: 700 }}>{user && user.name}</Typography>
              <Typography sx={{ fontSize: 13, color: tokens.color.textMuted, wordBreak: "break-all" }}>{user && user.email}</Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                setAccountEl(null);
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

      <MobileNav menu={menu} open={mobileOpen} />
    </Box>
  );
}

Header.propTypes = {
  menu: PropTypes.array.isRequired,
  notificationCount: PropTypes.number,
};

Header.defaultProps = { notificationCount: 0 };
