"use client";

import { useState } from "react";
import BaseCard from "./BaseCard";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import LanguageIcon from "@mui/icons-material/Language";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { submitWebsiteInterest } from "@/features/contact/api/airtable";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const PRIORITIES = [
  "Getting found on Google or AI search",
  "Showcasing my portfolio and services",
  "Looking more professional",
];

export default function WebsiteBuildServiceCard({
  vendorId,
  businessName,
  alreadySubmitted
}: {
  vendorId: string;
  businessName: string;
  alreadySubmitted: boolean;
}) {
  const [interested, setInterested] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(alreadySubmitted);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!interested || loading) return;
    setLoading(true);
    setError(null);
    try {
      const success = await submitWebsiteInterest(vendorId, businessName, selected ?? "Not specified");
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
          Thanks for your interest! We&apos;ll be in touch soon.
        </Alert>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body1">
            Interested in a professional website? Our team can help.
          </Typography>

          <FormControlLabel
            data-testid="interested-checkbox"
            control={
              <Checkbox
                checked={interested}
                onChange={(e) => {
                  setInterested(e.target.checked);
                  if (!e.target.checked) setSelected(null);
                }}
              />
            }
            label={
              <Typography variant="body1" fontWeight={600}>
                Yes, I&apos;m interested
              </Typography>
            } />

          {interested && (
            <FormControl size="small" sx={{ maxWidth: 320 }}>
              <InputLabel>What&apos;s most important to you?</InputLabel>
              <Select
                value={selected ?? ""}
                label="What's most important to you?"
                onChange={(e) => setSelected(e.target.value || null)}
                data-testid='priority-select'
              >
                {PRIORITIES.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {error && <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>}

          {interested && (
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
              {loading ? "Submitting..." : "Submit"}
            </Button>
          )}
        </Box>
      )}
    </BaseCard>
  );
}