import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import tokens from "theme/tokens";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  destructive,
  withNote,
  noteLabel,
  busy,
  onConfirm,
  onClose,
}) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) setNote("");
  }, [open]);

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: tokens.font.heading, fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: tokens.color.textDim, lineHeight: 1.6 }}>{message}</Typography>
        {withNote && (
          <TextField
            label={noteLabel}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            multiline
            minRows={3}
            fullWidth
            sx={{ mt: 2.5 }}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onConfirm(note)}
          disabled={busy}
          color={destructive ? "error" : "primary"}
          startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.node,
  confirmLabel: PropTypes.string,
  destructive: PropTypes.bool,
  withNote: PropTypes.bool,
  noteLabel: PropTypes.string,
  busy: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

ConfirmDialog.defaultProps = {
  message: "",
  confirmLabel: "Confirm",
  destructive: false,
  withNote: false,
  noteLabel: "Note (optional)",
  busy: false,
};
