"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import BaseCard from "./BaseCard";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface PhotoReviewCardProps {
  photoUrl: string | null;
  onSubmit: (approved: boolean, credits?: string) => void;
}

export default function PhotoReviewCard({ photoUrl, onSubmit }: PhotoReviewCardProps) {
  const [approved, setApproved] = useState(false);
  const [credits, setCredits] = useState("");

  const handleSubmit = () => {
    if (!approved) return; // maybe show an alert/snackbar
    onSubmit(approved, credits);
  };

  return (
    <BaseCard
      title="Review Your Photo"
      icon={<WarningAmberIcon color="warning" />}
      sx={{ mb: 4, borderLeft: 4, borderColor: 'warning.main' }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="body1" fontWeight={500}>
          Your uploaded photo will remain unpublished until you approve it.
        </Typography>

        {photoUrl && (
          <Box
            component="img"
            src={photoUrl}
            alt="Uploaded work photo"
            sx={{
              width: "100%",
              maxWidth: 400,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              objectFit: "cover",
            }}
          />
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Checkbox
            checked={approved}
            onChange={(e) => setApproved(e.target.checked)}
          />
          <Typography variant="body2">
            I confirm that this photo can be published.
          </Typography>
        </Box>

        <TextField
          label="Photographer credits (optional)"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
          fullWidth
          size="small"
        />

        <Button
          variant="contained"
          color="warning"
          onClick={handleSubmit}
          disabled={!approved}
        >
          Approve Photo
        </Button>
      </Box>
    </BaseCard>
  );
}
