import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import tokens from "theme/tokens";

export default function KpiCard({ label, value, caption, valueColor, loading, children }) {
  return (
    <Box
      sx={{
        bgcolor: tokens.color.card,
        border: `1px solid ${tokens.color.border}`,
        borderRadius: `${tokens.radius.lg}px`,
        px: 3,
        py: 2.75,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
        minWidth: 0,
      }}
    >
      <Typography sx={{ fontSize: 14, color: tokens.color.textMuted }}>{label}</Typography>
      {loading ? (
        <Skeleton variant="text" width="50%" sx={{ fontSize: 40, bgcolor: "#262626" }} />
      ) : (
        <Typography
          className="num"
          sx={{
            fontFamily: tokens.font.heading,
            fontSize: { xs: 32, xl: 40 },
            fontWeight: 700,
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            color: valueColor || tokens.color.text,
          }}
        >
          {value}
        </Typography>
      )}
      {children}
      {caption && (
        <Typography sx={{ fontSize: 13, color: tokens.color.textSubtle }}>{caption}</Typography>
      )}
    </Box>
  );
}

KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
  caption: PropTypes.node,
  valueColor: PropTypes.string,
  loading: PropTypes.bool,
  children: PropTypes.node,
};
