"use client"

import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/system/useMediaQuery/useMediaQuery";

export function useScrollToTopOnMobile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return () => {
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
}