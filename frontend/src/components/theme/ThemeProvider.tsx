"use client"
import { createTheme } from "@mui/material/styles";
import MuiThemeProvider from "@mui/material/styles/ThemeProvider";
import { ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { getDesignTokens } from "./themePrimitives";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = createTheme(getDesignTokens());

  return (
    <MuiThemeProvider theme={theme} defaultMode="light">
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
