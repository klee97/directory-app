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
  const [approved, setApproved] = useState(false);
  const [credits, setCredits] = useState(initialCredits ?? "");
  const [loading, setLoading] = useState<LoadingState>(false);
  const [done, setDone] = useState<"approved" | "removed" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!approved) {
      setError("Please confirm to continue.");
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
            <Alert severity="warning" sx={{ py: 0.5 }}>
              Your current photo will be <strong>automatically removed on {REMOVAL_DATE},</strong> unless
              you confirm your approval below.
            </Alert>

            {error && <Alert severity="error" sx={{ py: 0.5, width: "fit-content" }}>{error}</Alert>}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox
                checked={approved}
                color="default"
                onChange={(e) => setApproved(e.target.checked)}
              />
              <Typography variant="body1">
                I confirm I have the rights to this photo and authorize Asian Wedding Makeup to
                display it as described in our{" "}
                <Link href="/vendor-terms" target="_blank" rel="noopener noreferrer">
                  Vendor Terms of Service
                </Link>
                .
              </Typography>
            </Box>

            <TextField
              label="Add a photo credit (optional)"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              size="small"
              sx={{ maxWidth: 280 }}
            />

            <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleApprove}
                color="info"
                disabled={loading === "approve" || loading === "remove"}
              >
                {loading === "approve" ? "Saving..." : "Approve Photo"}
              </Button>
              <Link href={`/partner/dashboard/profile`} variant="h6" color="text.secondary">
                Remove or replace photo
              </Link>
            </Box>
          </Box>
        </Box>
      )}
    </BaseCard>
  );
}