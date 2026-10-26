import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import tokens from "theme/tokens";

export default function FilterChips({ options, value, onChange, ariaLabel }) {
  return (
    <Box role="group" aria-label={ariaLabel} sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <ButtonBase
            key={option.value}
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            sx={{
              height: 40,
              px: 2,
              borderRadius: 999,
              fontSize: 14,
              fontFamily: tokens.font.body,
              fontWeight: active ? 700 : 400,
              border: `1px solid ${active ? tokens.color.accent : tokens.color.borderStrong}`,
              bgcolor: active ? tokens.color.accentTint : "transparent",
              color: active ? "#ffffff" : "#cfcfcf",
            }}
          >
            {option.label}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

FilterChips.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.string }))
    .isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string,
};
