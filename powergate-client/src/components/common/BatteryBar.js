import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import tokens from "theme/tokens";
import { percent } from "utils/format";

// Stacked bar: used / committed / available as a share of battery max.
export default function BatteryBar({ battery, height, showLegend }) {
  const max = Number(battery && battery.max) || 0;
  const used = percent(battery && battery.used, max);
  const committed = Math.min(100 - used, percent(battery && battery.committed, max));
  const available = Math.max(0, 100 - used - committed);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      <Box
        role="img"
        aria-label={`Battery: used ${used}%, committed ${committed}%, available ${available}%`}
        sx={{
          height,
          borderRadius: 999,
          bgcolor: tokens.color.border,
          display: "flex",
          overflow: "hidden",
        }}
      >
        <Box sx={{ width: `${used}%`, bgcolor: tokens.battery.used }} />
        <Box sx={{ width: `${committed}%`, bgcolor: tokens.battery.committed }} />
        <Box sx={{ width: `${available}%`, bgcolor: tokens.battery.available }} />
      </Box>
      {showLegend && (
        <Box sx={{ display: "flex", gap: 1.75, flexWrap: "wrap", fontSize: 12, color: tokens.color.textMuted }}>
          <span className="num">Used {used}%</span>
          <span className="num">Committed {committed}%</span>
          <span className="num">Available {available}%</span>
        </Box>
      )}
    </Box>
  );
}

BatteryBar.propTypes = {
  battery: PropTypes.shape({
    max: PropTypes.number,
    used: PropTypes.number,
    committed: PropTypes.number,
    available: PropTypes.number,
  }),
  height: PropTypes.number,
  showLegend: PropTypes.bool,
};

BatteryBar.defaultProps = { battery: null, height: 8, showLegend: true };
