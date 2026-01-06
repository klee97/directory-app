"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PhotoPromptProps {
  hasProfilePhoto: boolean;
}

export default function PhotoPrompt({ hasProfilePhoto }: PhotoPromptProps) {
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(!hasProfilePhoto);

  if (!showPrompt || hasProfilePhoto) {
    return null;
  }

  return (
    <Alert 
      severity="info"
      icon={<CameraAltOutlinedIcon />}
      sx={{ mb: 3 }}
      action={
        <IconButton
          aria-label="close"
          color="inherit"
          size="small"
          onClick={() => setShowPrompt(false)}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      }
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
        Add a client photo to get more engagement!
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Artist profiles with photos receive more than twice the views from brides.
      </Typography>
      <Button 
        variant="contained" 
        size="small"
        onClick={() => router.push("/partner/manage/profile")}
        sx={{ bgcolor: "info.main", color: "white" }}
      >
        Add Photo
      </Button>
    </Alert>
  );
}