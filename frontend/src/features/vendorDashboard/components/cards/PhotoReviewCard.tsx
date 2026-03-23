"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import BaseCard from "./BaseCard";
import { CheckCircle } from "@mui/icons-material";
import Link from "@mui/material/Link";

const REMOVAL_DATE = "April 30, 2026";

type LoadingState = "approve" | "remove" | false;

interface PhotoReviewCardProps {
  photoUrl: string | null;
  mediaId: string;
  initialCredits?: string | null;
  onApprove: (mediaId: string, credits: string) => Promise<{ success: boolean; error?: string }>;
}

export default function PhotoReviewCard({ photoUrl, mediaId, initialCredits, onApprove }: PhotoReviewCardProps) {
  const [credits, setCredits] = useState(initialCredits ?? "");
  const [loading, setLoading] = useState<LoadingState>(false);
  const [done, setDone] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading("approve");
    setError(null);
    try {
      const result = await onApprove(mediaId, credits);
      if (!result.success) {
        setError(result.error ?? "Something went wrong. Please try again.");
      } else {
        setDone(true);
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
          Success! Your photo has been approved.
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
            <Typography variant="body1" color="text.primary">
              Review the photo we have on file for your business.
              You can add a photo credit if needed.
            </Typography>
            <TextField
              label="Photo credit (optional)"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              size="small"
              sx={{ maxWidth: 280 }}
            />
            <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
              {error && <Alert severity="error" sx={{ py: 0.5, width: "fit-content" }}>{error}</Alert>}
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  onClick={handleApprove}
                  color="info"
                  disabled={loading === "approve" || loading === "remove"}
                >
                  {loading === "approve" ? "Saving..." : "Approve Photo"}
                </Button>
                <Link href={`/partner/dashboard/profile`} variant="h6" color="text.secondary">
                  Change photo
                </Link>
              </Box>
              <Typography variant="caption" color="text.disabled">
                By approving, you confirm this photo complies with our{" "}
                <Link href="/vendor-terms" target="_blank" rel="noopener noreferrer" color="secondary">
                  Vendor Terms of Service
                </Link>
                .
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </BaseCard>
  );
}