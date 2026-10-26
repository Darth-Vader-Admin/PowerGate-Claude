import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom";
import Link from "@mui/material/Link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import tokens from "theme/tokens";

export default function ReturnLink({ to, label }) {
  return (
    <Link
      component={RouterLink}
      to={to}
      underline="none"
      sx={{
        alignSelf: "flex-start",
        minHeight: 44,
        display: "flex",
        alignItems: "center",
        gap: 1,
        fontSize: 15,
        fontWeight: 700,
        color: tokens.color.link,
        "&:hover": { color: tokens.color.linkHover },
      }}
    >
      <ArrowBackIcon sx={{ fontSize: 18 }} />
      {label}
    </Link>
  );
}

ReturnLink.propTypes = { to: PropTypes.string, label: PropTypes.string };
ReturnLink.defaultProps = { to: "/client/dashboard", label: "Return to dashboard" };
