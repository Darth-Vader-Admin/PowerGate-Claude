import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import tokens from "theme/tokens";
import { statusTone } from "utils/format";

export default function StatusPill({ label, tone }) {
  const resolved = tone || statusTone(label);
  const { bg, fg } = tokens.pill[resolved] || tokens.pill.neutral;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1.5,
        py: 0.75,
        borderRadius: 999,
        bgcolor: bg,
        color: fg,
        fontSize: 13,
        fontWeight: 700,
        whiteSpace: "nowrap",
        lineHeight: 1.2,
      }}
    >
      {label || "—"}
    </Box>
  );
}

StatusPill.propTypes = {
  label: PropTypes.string,
  tone: PropTypes.oneOf(["success", "warning", "error", "info", "neutral"]),
};
