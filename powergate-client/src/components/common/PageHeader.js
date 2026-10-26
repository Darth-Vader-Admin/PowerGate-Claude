import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import tokens from "theme/tokens";

export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", md: "center" },
        flexDirection: { xs: "column", md: "row" },
        gap: 3,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {eyebrow && (
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: tokens.color.link,
            }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h1" component="h1" sx={{ fontSize: { xs: 32, md: 40 } }}>
          {title}
        </Typography>
        {description && (
          <Typography sx={{ fontSize: 16, color: tokens.color.textMuted }}>{description}</Typography>
        )}
      </Box>
      {actions && (
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", flexShrink: 0 }}>{actions}</Box>
      )}
    </Box>
  );
}

PageHeader.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  actions: PropTypes.node,
};
