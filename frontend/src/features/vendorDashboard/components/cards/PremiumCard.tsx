"use client";

import { useState } from "react";
import BaseCard from "./BaseCard";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { submitPremiumWaitlist } from "@/features/contact/api/airtable";

export default function PremiumWaitlistCard({
  vendorId,
  businessName,
  alreadySubmitted,
}: {
  vendorId: string;
  businessName: string;
  alreadySubmitted: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(alreadySubmitted);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const success = await submitPremiumWaitlist(vendorId, businessName);
      if (success) setDone(true);
      else setError("Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseCard title="Join Premium" icon={<TrendingUpIcon sx={{ color: "text.primary" }} />}>
      {done ? (
        <Alert severity="success" icon={<CheckCircleIcon />}>
          You&apos;re on the list!
        </Alert>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body1">
            We&apos;re working on Premium profiles with more tools and visibility. Join the waitlist for early access and updates!
          </Typography>

          {error && (
            <Alert severity="error" sx={{ py: 0.5 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              alignSelf: "flex-start",
              bgcolor: "primary.main",
              color: "white",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            {loading ? "Submitting..." : "Join Waitlist"}
          </Button>
        </Box>
      )}
    </BaseCard>
  );
}