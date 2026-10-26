import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import tokens from "theme/tokens";

export default function FullPageMessage({ loading, title, message, action }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: tokens.color.panel,
        color: tokens.color.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 3,
        textAlign: "center",
      }}
    >
      {loading && <CircularProgress sx={{ color: tokens.color.accent }} />}
      {title && <Typography variant="h2">{title}</Typography>}
      {message && <Typography sx={{ color: tokens.color.textMuted, maxWidth: 480 }}>{message}</Typography>}
      {action}
    </Box>
  );
}

FullPageMessage.propTypes = {
  loading: PropTypes.bool,
  title: PropTypes.string,
  message: PropTypes.node,
  action: PropTypes.node,
};
