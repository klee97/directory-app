"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import BaseCard from "./BaseCard";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { CheckCircle } from "@mui/icons-material";
import Link from "@mui/material/Link";

const REMOVAL_DATE = "March 31, 2026";

type LoadingState = "approve" | "remove" | false;

interface PhotoReviewCardProps {
  photoUrl: string | null;
  mediaId: string;
  initialCredits?: string | null;
  onApprove: (mediaId: string, credits: string) => Promise<{ success: boolean; error?: string }>;
}

export default function PhotoReviewCard({ photoUrl, mediaId, initialCredits, onApprove }: PhotoReviewCardProps) {
  const [approved, setApproved] = useState(false);
  const [credits, setCredits] = useState(initialCredits ?? "");
  const [loading, setLoading] = useState<LoadingState>(false);
  const [done, setDone] = useState<"approved" | "removed" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!approved) {
      setError("Please confirm you have permission to use this photo before approving.");
      return;
    }
    setLoading("approve");
    setError(null);
    try {
      const result = await onApprove(mediaId, credits);
      if (!result.success) {
        setError(result.error ?? "Something went wrong. Please try again.");
      } else {
        setDone("approved");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseCard
      title="Action Required: Approve Your Photo"
      sx={{ border: "3px solid", borderColor: "info.light" }}
    >
      {done ? (
        <Alert severity="info" icon={<CheckCircle />}>
          All good! Your photo has been {done === "approved" ? "approved and will be displayed on your profile." : "removed from your profile."}
        </Alert>
      ) : (
        <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", sm: "row" } }}>

          {/* Thumbnail */}
          {photoUrl && (
            <Box
              component="img"
              src={photoUrl}
              alt="Your profile photo"
              sx={{
                width: { xs: 120, sm: 160 },
                height: "auto",
                flexShrink: 0,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                objectFit: "cover",
              }}
            />
          )}

          {/* Form */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1 }}>
            <Alert severity="warning" sx={{ py: 0.5 }}>
              Your photo will be <strong>automatically removed on {REMOVAL_DATE}</strong> unless
              you confirm your approval below.
            </Alert>



            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox
                checked={approved}
                color="default"
                onChange={(e) => setApproved(e.target.checked)}
              />
              <Typography variant="body1">
                I confirm I have the right to use this photo and consent to it being displayed on my profile.
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>}

            <TextField
              label="Photographer credit (optional)"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              size="small"
              sx={{ maxWidth: 280 }}
            />

            <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                onClick={handleApprove}
                color="info"
                disabled={loading === "approve" || loading === "remove"}
              >
                {loading === "approve" ? "Saving..." : "Approve Photo"}
              </Button>
              <Link href={`/partner/dashboard/profile`} variant="h4" color="text.secondary">
                Remove or replace photo
              </Link>
            </Box>
          </Box>
        </Box>
      )}
    </BaseCard>
  );
}