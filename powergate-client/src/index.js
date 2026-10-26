import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "theme";
import { AuthProvider } from "auth/AuthContext";
import { ToastProvider } from "hooks/useToast";
import App from "App";

// HashRouter: Catalyst Web Client Hosting serves static files, so deep links like
// /app/#/client/profile survive a refresh without server-side rewrites.
const root = createRoot(document.getElementById("app"));

root.render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>
);
