"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Computer from "@mui/icons-material/Computer";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";

const STORAGE_KEY = "desktop-prompt-dismissed";

interface DesktopPromptOverlayProps {
  onContinue?: () => void;
}

export default function DesktopPromptOverlay({ onContinue }: DesktopPromptOverlayProps) {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isDismissed = localStorage.getItem(STORAGE_KEY) === "dismissed";
    if (isMobileDevice && !isDismissed) {
      setVisible(true);
    }
  }, []);

  const handleContinue = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
    onContinue?.();
  };

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: theme.zIndex.modal,
        bgcolor: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
      }}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 3,
          p: 4,
          maxWidth: 360,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          position: "relative",
        }}
      >
        <IconButton
          size="small"
          onClick={handleContinue}
          aria-label="close"
          sx={{ position: "absolute", top: 12, right: 12, color: "text.secondary" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            bgcolor: "info.light",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Computer sx={{ color: "info.contrastText", fontSize: 28 }} />
        </Box>

        <Typography variant="h6" fontWeight="bold">
          Use desktop for best experience
        </Typography>

        <Typography variant="body2" color="text.secondary">
          The profile editor is designed for a larger screen. For the best experience, open this page on your computer or tablet.
        </Typography>

        <Button
          variant="contained"
          fullWidth
          onClick={handleContinue}
          sx={{ mt: 1 }}
        >
          Continue anyway
        </Button>
      </Box>
    </Box>
  );
}