"use client";

import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { ReactNode, useEffect, useState } from "react";
import { CssBaseline } from "@mui/material";
import { PaletteMode } from "@mui/material";
import { getDesignTokens } from "./themePrimitives";

// const getDesignTokens = (mode: PaletteMode) => ({
//   palette: {
//     mode,
//     background: {
//       default: mode === "dark" ? "hsl(220, 30%, 5%)" : "hsl(30, 80%, 90%)",
//     },
//   },
//   cssVariables: {
//     colorSchemeSelector: 'data-mui-color-scheme',
//     cssVarPrefix: 'template',
//   },
//   colorSchemes, // Recently added in v6 for building light & dark mode app, see https://mui.com/material-ui/customization/palette/#color-schemes
//   shadows,
//   shape,
//   typography

// });

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as PaletteMode;
    if (storedTheme) {
      setMode(storedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", mode);
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  const theme = createTheme(getDesignTokens(mode));

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
