import PropTypes from "prop-types";
import Box from "@mui/material/Box";

export default function KpiGrid({ children }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0,1fr)",
          sm: "repeat(2, minmax(0,1fr))",
          lg: "repeat(4, minmax(0,1fr))",
        },
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}

KpiGrid.propTypes = { children: PropTypes.node.isRequired };
