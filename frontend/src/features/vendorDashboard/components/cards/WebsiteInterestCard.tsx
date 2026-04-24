"use client";

import { useState } from "react";
import BaseCard from "./BaseCard";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import LanguageIcon from "@mui/icons-material/Language";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { submitWebsiteInterest } from "@/features/contact/api/airtable";

const PRIORITIES = [
  "Getting found on Google or AI search",
  "Showcasing my portfolio and services",
  "Looking more professional",
];

export default function WebsiteBuildServiceCard({ vendorId, businessName }: { vendorId: string; businessName: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

const handleSubmit = async () => {
  if (!selected || loading) return;
  setLoading(true);
  setError(null);
  try {
    const success = await submitWebsiteInterest(vendorId, businessName, selected);
    if (success) setDone(true);
    else setError("Something went wrong. Please try again.");
  } catch {
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};
  return (
    <BaseCard title="Get a Business Website" icon={<LanguageIcon sx={{ color: "text.primary" }} />}>
      {done ? (
        <Alert severity="success" icon={<CheckCircleIcon />}>
          Thanks! We&apos;ll be in touch soon.
        </Alert>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body1">
            Interested in a professional website? Our team can help.
          </Typography>

          <Typography variant="body2" color="text.secondary">
            What&apos;s most important to you in a website?
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {PRIORITIES.map((priority) => (
              <Box
                key={priority}
                onClick={() => setSelected(priority)}
                sx={{
                  px: 2,
                  py: 1.25,
                  border: "1px solid",
                  borderColor: selected === priority ? "primary.main" : "divider",
                  borderRadius: 1,
                  cursor: "pointer",
                  bgcolor: selected === priority ? "primary.50" : "transparent",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={selected === priority ? 600 : 400}
                  color={selected === priority ? "primary.main" : "text.primary"}
                >
                  {priority}
                </Typography>
              </Box>
            ))}
          </Box>

          {error && <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>}

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selected || loading}
            sx={{
              alignSelf: "flex-start",
              bgcolor: "primary.main",
              color: "white",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            {loading ? "Submitting..." : "I'm Interested"}
          </Button>
        </Box>
      )}
    </BaseCard>
  );
}