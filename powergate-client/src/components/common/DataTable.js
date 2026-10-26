import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import tokens from "theme/tokens";

/*
  columns: [{ key, label, align?, render?(row), nowrap?, muted?, strong?, num? }]
  Horizontal scroll lives inside the card so the page never scrolls sideways.
*/
export default function DataTable({ columns, rows, loading, error, onRetry, emptyText, minWidth, rowKey }) {
  const cellBase = {
    px: 2,
    py: 2,
    borderBottom: `1px solid ${tokens.color.borderMuted}`,
    color: tokens.color.textSoft,
    verticalAlign: "middle",
    fontSize: 14,
  };

  let body;
  if (loading) {
    body = [0, 1, 2].map((i) => (
      <Box component="tr" key={`sk-${i}`}>
        {columns.map((col) => (
          <Box component="td" key={col.key} sx={cellBase}>
            <Skeleton variant="text" sx={{ bgcolor: "#262626" }} />
          </Box>
        ))}
      </Box>
    ));
  } else if (error) {
    body = (
      <Box component="tr">
        <Box component="td" colSpan={columns.length} sx={{ ...cellBase, py: 4, textAlign: "center" }}>
          <Typography sx={{ color: tokens.pill.error.fg, fontWeight: 700, mb: 1 }}>
            {typeof error === "string" ? error : error.message}
          </Typography>
          {onRetry && (
            <Button variant="outlined" size="small" onClick={onRetry}>
              Try again
            </Button>
          )}
        </Box>
      </Box>
    );
  } else if (!rows || rows.length === 0) {
    body = (
      <Box component="tr">
        <Box
          component="td"
          colSpan={columns.length}
          sx={{ ...cellBase, py: 5, textAlign: "center", color: tokens.color.textMuted }}
        >
          {emptyText}
        </Box>
      </Box>
    );
  } else {
    body = rows.map((row, index) => (
      <Box
        component="tr"
        key={rowKey(row, index)}
        sx={{ "&:last-of-type td": { borderBottom: "none" } }}
      >
        {columns.map((col) => (
          <Box
            component="td"
            key={col.key}
            className={col.num ? "num" : undefined}
            sx={{
              ...cellBase,
              textAlign: col.align || "left",
              whiteSpace: col.nowrap ? "nowrap" : undefined,
              color: col.muted ? tokens.color.textDim : cellBase.color,
              fontWeight: col.strong ? 700 : undefined,
            }}
          >
            {col.render ? col.render(row) : row[col.key] ?? "—"}
          </Box>
        ))}
      </Box>
    ));
  }

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box
        component="table"
        sx={{ width: "100%", borderCollapse: "collapse", minWidth, fontSize: 14 }}
      >
        <Box component="thead">
          <Box component="tr">
            {columns.map((col) => (
              <Box
                component="th"
                key={col.key}
                scope="col"
                sx={{
                  textAlign: col.align || "left",
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  color: tokens.color.textMuted,
                  px: 2,
                  py: 1.75,
                  borderBottom: `1px solid ${tokens.color.border}`,
                  bgcolor: tokens.color.cardHeader,
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">{body}</Box>
      </Box>
    </Box>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(["left", "right", "center"]),
      render: PropTypes.func,
      nowrap: PropTypes.bool,
      muted: PropTypes.bool,
      strong: PropTypes.bool,
      num: PropTypes.bool,
    })
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onRetry: PropTypes.func,
  emptyText: PropTypes.string,
  minWidth: PropTypes.number,
  rowKey: PropTypes.func,
};

DataTable.defaultProps = {
  rows: [],
  loading: false,
  error: null,
  onRetry: null,
  emptyText: "Nothing here yet.",
  minWidth: 760,
  rowKey: (row, index) => row.id || index,
};
