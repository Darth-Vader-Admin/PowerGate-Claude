import PropTypes from "prop-types";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import tokens from "theme/tokens";

export default function SearchInput({ value, onChange, placeholder, label }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        height: 44,
        px: 1.5,
        width: 260,
        maxWidth: "100%",
        borderRadius: `${tokens.radius.sm}px`,
        border: `1px solid ${tokens.color.borderStrong}`,
        bgcolor: tokens.color.input,
        "&:focus-within": { borderColor: tokens.color.accent },
      }}
    >
      <SearchIcon sx={{ fontSize: 18, color: tokens.color.textSubtle }} />
      <InputBase
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputProps={{ "aria-label": label || placeholder }}
        sx={{ flex: 1, fontSize: 14, color: tokens.color.text }}
      />
    </Box>
  );
}

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
};

SearchInput.defaultProps = { placeholder: "Search", label: "" };
