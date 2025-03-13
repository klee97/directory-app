'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { BackendVendorRecommendationInsert } from '@/types/vendor';
import { createRecommendation } from '../api/createRecommendation';
import toast from 'react-hot-toast';

export const VENDOR_RECOMMENDATION_INPUT_DEFAULT: BackendVendorRecommendationInsert = {
  business_name: "",
  website: "",
  region: "",
  ig_handle: "",
  recommended_by: "",
  notes: "",
  status: 'pending'
} as const;

const RecommendationForm = () => {
  const [recommendation, setRecommendation] = useState<BackendVendorRecommendationInsert>(VENDOR_RECOMMENDATION_INPUT_DEFAULT);
  const [errors, setErrors] = useState({ business_name: false, region: false });

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {
      business_name: !recommendation.business_name.trim(),
      region: !recommendation.region.trim(),
    };

    if (newErrors.business_name || newErrors.region) {
      setErrors(newErrors);
      return;
    }
    const loadingToast = toast.loading("Submitting your recommendation...");

    try {
      const res = await createRecommendation(recommendation);
      if (!res.id) throw new Error("Failed to submit recommendation");

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Thank you! Your recommendation has been submitted."); setRecommendation(VENDOR_RECOMMENDATION_INPUT_DEFAULT);
    } catch (error) {
      console.error(error);
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Is there an artist we&apos;re missing that should be listed here? Let us know below!
      </Typography>
      <br />

      <Grid container spacing={3}>
        <Grid size={6}>

          <TextField
            required
            fullWidth
            label="Artist or Business Name"
            variant="outlined"
            value={recommendation.business_name ?? ""}
            onChange={(e) => setRecommendation({ ...recommendation, business_name: e.target.value })}
            error={errors.business_name}
            helperText={errors.business_name ? "Business name is required" : ""}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            required
            fullWidth
            label="Location"
            variant="outlined"
            value={recommendation.region ?? ""}
            onChange={(e) => setRecommendation({ ...recommendation, region: e.target.value })}
            error={errors.region}
            helperText={errors.region ? "Location is required" : ""}
          />
        </Grid>
        <Grid size={6}>

          <TextField
            fullWidth
            label="Website"
            variant="outlined"
            value={recommendation.website ?? ""}
            onChange={(e) => setRecommendation({ ...recommendation, website: e.target.value })}
          />
        </Grid>
        <Grid size={6}>

          <TextField
            fullWidth
            label="Instagram"
            variant="outlined"
            value={recommendation.ig_handle ?? ""}
            onChange={(e) => setRecommendation({ ...recommendation, ig_handle: e.target.value })}
          />
        </Grid>

        <Grid size={8}>

          <TextField
            fullWidth
            label="Why do you recommend this artist?"
            variant="outlined"
            value={recommendation.notes ?? ""}
            onChange={(e) => setRecommendation({ ...recommendation, notes: e.target.value })}
          />
        </Grid>
        <Grid size={4}>
          <TextField
            fullWidth
            label="Your email (optional)"
            variant="outlined"
            value={recommendation.recommended_by ?? ""}
            onChange={(e) => setRecommendation({ ...recommendation, recommended_by: e.target.value })}
          />
        </Grid>
        <Grid>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ width: 'auto' }}
          >
            Submit Recommendation
          </Button>
        </Grid>
      </Grid>
    </Box >
  );
};

export default RecommendationForm;