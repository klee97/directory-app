'use client';

import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { BackendVendorRecommendationInsert } from '@/types/vendor';
import { createRecommendation } from '@/features/recommendations/api/createRecommendation';
import { useNotification } from '@/contexts/NotificationContext';
import ReCaptcha, { ReCaptchaRef } from '@/components/security/ReCaptcha';
import { isDevOrPreview } from '@/lib/env/env';

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
  const { addNotification } = useNotification();
  const [recommendation, setRecommendation] = useState<BackendVendorRecommendationInsert>(VENDOR_RECOMMENDATION_INPUT_DEFAULT);
  const [errors, setErrors] = useState({ business_name: false, region: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef<ReCaptchaRef>(null);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {
      business_name: !recommendation.business_name.trim(),
      region: !recommendation.region.trim(),
    };

    setErrors(newErrors);
    if (newErrors.business_name || newErrors.region) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Execute reCAPTCHA and get token.
      // When the widget is not mounted (no NEXT_PUBLIC_RECAPTCHA_SITE_KEY) in a
      // dev/preview environment, fall back to the 'test-bypass' token which
      // verifyRecaptchaToken() accepts without calling Google's siteverify API.
      const recaptchaToken =
        (await recaptchaRef.current?.executeAsync()) ??
        (isDevOrPreview() ? 'test-bypass' : null);

      if (!recaptchaToken) {
        addNotification("CAPTCHA verification failed. Please try again.", "error");
        return;
      }

      // Add token to submission data
      const submissionData = {
        ...recommendation,
        recaptchaToken
      };
      const res = await createRecommendation(submissionData);
      if (!res.id) throw new Error("Failed to submit recommendation");

      addNotification("Thank you! Your recommendation has been submitted.");
      setRecommendation(VENDOR_RECOMMENDATION_INPUT_DEFAULT);
      recaptchaRef.current?.reset();
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        addNotification(error.message || "Something went wrong. Please try again.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        required
        fullWidth
        label="Artist or Business Name"
        value={recommendation.business_name ?? ""}
        onChange={(e) => setRecommendation({ ...recommendation, business_name: e.target.value })}
        error={errors.business_name}
        helperText={errors.business_name ? "Business name is required" : ""}
        sx={{ mb: 2 }}
      />
      <TextField
        required
        fullWidth
        label="Location"
        value={recommendation.region ?? ""}
        onChange={(e) => setRecommendation({ ...recommendation, region: e.target.value })}
        error={errors.region}
        helperText={errors.region ? "Location is required" : ""}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Website"
        slotProps={{ htmlInput: { inputMode: 'url' } }}
        value={recommendation.website ?? ""}
        onChange={(e) => setRecommendation({ ...recommendation, website: e.target.value })}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Instagram"
        value={recommendation.ig_handle ?? ""}
        onChange={(e) => setRecommendation({ ...recommendation, ig_handle: e.target.value })}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Your email (optional)"
        autoComplete="email"
        type="email"
        slotProps={{ htmlInput: { inputMode: 'email' } }}
        value={recommendation.recommended_by ?? ""}
        onChange={(e) => setRecommendation({ ...recommendation, recommended_by: e.target.value })}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Why do you recommend this artist?"
        value={recommendation.notes ?? ""}
        onChange={(e) => setRecommendation({ ...recommendation, notes: e.target.value })}
        sx={{ mb: 2 }}
      />
      <ReCaptcha
        ref={recaptchaRef}
        size="invisible"
        onExpired={() => console.warn('reCAPTCHA expired')}
        onErrored={() => console.warn('reCAPTCHA errored')}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Recommendation'}
      </Button>
    </Box>
  );
};

export default RecommendationForm;