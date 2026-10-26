import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import brand from "config/brand";
import tokens from "theme/tokens";

// Logo tile. Uses brand.logo (an image from src/assets) when set, otherwise the CSS "PG" mark.
export default function BrandMark({ size }) {
  if (brand.logo) {
    return (
      <Box
        component="img"
        src={brand.logo}
        alt="PowerGate"
        sx={{ width: size, height: size, objectFit: "contain", borderRadius: "14px" }}
      />
    );
  }
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        borderRadius: "14px",
        bgcolor: "#ffffff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
      }}
    >
      <Box
        component="span"
        sx={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: size * 0.385,
          color: tokens.color.brandMark,
          lineHeight: 1,
        }}
      >
        {brand.markText}
      </Box>
      <Box
        component="span"
        sx={{
          fontSize: Math.max(6, size * 0.067),
          fontWeight: 700,
          letterSpacing: "0.6px",
          color: tokens.color.brandMark,
          whiteSpace: "nowrap",
        }}
      >
        {brand.markSubText}
      </Box>
    </Box>
  );
}

BrandMark.propTypes = { size: PropTypes.number };
BrandMark.defaultProps = { size: 104 };
