import { createTheme } from "@mui/material/styles";
import tokens from "theme/tokens";

const { color, font } = tokens;

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: color.accent, dark: color.accentHover, contrastText: "#ffffff" },
    error: { main: "#ef4444" },
    warning: { main: "#facc15" },
    success: { main: "#22c55e" },
    background: { default: color.pageBg, paper: color.card },
    text: { primary: color.text, secondary: color.textMuted },
    divider: color.border,
  },
  typography: {
    fontFamily: font.body,
    h1: { fontFamily: font.heading, fontWeight: 700, fontSize: "2.5rem", lineHeight: 1.1 },
    h2: { fontFamily: font.heading, fontWeight: 600, fontSize: "1.5rem" },
    h3: { fontFamily: font.heading, fontWeight: 600, fontSize: "1.375rem" },
    h4: { fontFamily: font.heading, fontWeight: 600, fontSize: "1.25rem" },
    button: { fontWeight: 700, textTransform: "none", fontSize: "0.9375rem" },
  },
  shape: { borderRadius: tokens.radius.md },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: color.pageBg, color: color.text },
        a: { color: color.link },
        ".num": { fontVariantNumeric: "tabular-nums" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: tokens.radius.md, minHeight: 40, paddingInline: 18 },
        sizeLarge: { minHeight: 50, paddingInline: 26, fontSize: "1rem" },
        outlined: {
          borderColor: color.borderButton,
          color: color.text,
          "&:hover": { borderColor: color.textMuted, backgroundColor: "rgba(255,255,255,0.04)" },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: color.input,
          borderRadius: tokens.radius.md,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: color.borderStrong },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: color.textSubtle },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: color.accent },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { color: color.textSoft, fontWeight: 700 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: color.card,
          border: `1px solid ${color.border}`,
          borderRadius: tokens.radius.xl,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { backgroundColor: color.card, border: `1px solid ${color.border}` },
      },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { backgroundColor: "#262626", fontSize: "0.8125rem" } },
    },
  },
});

export default theme;
