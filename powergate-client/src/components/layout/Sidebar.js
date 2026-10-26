import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import BrandMark from "components/layout/BrandMark";
import navIcons from "components/layout/navIcons";
import appConfig from "config/app";
import tokens from "theme/tokens";

const itemSx = {
  minHeight: 52,
  px: 2.25,
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 1.75,
  fontSize: 17,
  fontFamily: tokens.font.body,
  textDecoration: "none",
  color: tokens.color.sidebarText,
  width: "100%",
  textAlign: "left",
  "&:hover": { bgcolor: "#f5e6e8" },
  "&.active": {
    bgcolor: tokens.color.accent,
    color: "#ffffff",
    fontWeight: 700,
  },
};

export default function Sidebar({ menu, onNavigate }) {
  return (
    <Box
      component="nav"
      aria-label="PowerGate menu"
      sx={{
        width: "100%",
        bgcolor: tokens.color.sidebar,
        borderRadius: `${tokens.radius.xxl}px`,
        overflow: "hidden",
        boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
        color: tokens.color.sidebarText,
        pb: 2.5,
      }}
    >
      <Box
        sx={{
          pt: 4,
          pb: 3.5,
          px: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2.25,
          background: `linear-gradient(180deg, ${tokens.color.sidebarGradientTop} 0%, #ffffff 100%)`,
        }}
      >
        <BrandMark size={104} />
        <Typography
          sx={{ fontFamily: tokens.font.heading, fontSize: 28, fontWeight: 700, color: "#141414" }}
        >
          {appConfig.appName}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, px: 1.25, pt: 1 }}>
        {menu.map((entry) => {
          if (entry.section) {
            return (
              <Typography
                key={entry.key}
                sx={{
                  pt: 2.25,
                  pb: 0.75,
                  px: 2,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: tokens.color.sidebarSection,
                }}
              >
                {entry.label}
              </Typography>
            );
          }
          const Icon = navIcons[entry.icon] || navIcons.dashboard;
          if (entry.href) {
            return (
              <ButtonBase
                key={entry.key}
                component="a"
                href={entry.href}
                target="_blank"
                rel="noopener noreferrer"
                sx={itemSx}
              >
                <Icon sx={{ fontSize: 22 }} />
                {entry.label}
              </ButtonBase>
            );
          }
          return (
            <ButtonBase
              key={entry.key}
              component={NavLink}
              to={entry.path}
              end
              onClick={onNavigate}
              sx={itemSx}
            >
              <Icon sx={{ fontSize: 22 }} />
              {entry.label}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}

Sidebar.propTypes = {
  menu: PropTypes.arrayOf(PropTypes.object).isRequired,
  onNavigate: PropTypes.func,
};

Sidebar.defaultProps = { onNavigate: undefined };
