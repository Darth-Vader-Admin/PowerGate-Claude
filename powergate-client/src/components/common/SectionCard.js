import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import tokens from "theme/tokens";

// Dark rounded card used for every report/form block. `flush` removes body padding (tables).
export default function SectionCard({ eyebrow, title, subtitle, actions, flush, children, id, sx }) {
  const hasHeader = eyebrow || title || actions;
  return (
    <Box
      component="section"
      id={id}
      sx={{
        bgcolor: tokens.color.card,
        border: `1px solid ${tokens.color.border}`,
        borderRadius: `${tokens.radius.xl}px`,
        overflow: "hidden",
        ...sx,
      }}
    >
      {hasHeader && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
            px: 3,
            pt: 2.75,
            pb: flush ? 2.75 : 0,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {eyebrow && (
              <Typography
                sx={{
                  fontSize: 12,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  color: tokens.color.textSubtle,
                }}
              >
                {eyebrow}
              </Typography>
            )}
            {title && (
              <Typography variant="h2" component="h2">
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography sx={{ fontSize: 14, color: tokens.color.textMuted }}>{subtitle}</Typography>
            )}
          </Box>
          {actions}
        </Box>
      )}
      <Box sx={flush ? undefined : { p: 3.5, pt: hasHeader ? 2.5 : 3.5 }}>{children}</Box>
    </Box>
  );
}

SectionCard.propTypes = {
  eyebrow: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
  flush: PropTypes.bool,
  children: PropTypes.node,
  id: PropTypes.string,
  sx: PropTypes.object,
};
