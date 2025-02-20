"use client"
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";
import { CssBaseline } from "@mui/material";
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
