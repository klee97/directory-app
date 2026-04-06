"use client";

import { useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { submitNewsletterForm } from "@/features/contact/api/submitForm";
import ReCaptcha, { ReCaptchaRef } from "@/components/security/ReCaptcha";
import { isDevOrPreview } from "@/lib/env/env";

export function NewsletterForm() {
  const [formData, setFormData] = useState({
    email: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef<ReCaptchaRef>(null);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);
    setIsSubmitting(true);

    try {
      const recaptchaToken =
        (await recaptchaRef.current?.executeAsync()) ??
        (isDevOrPreview() ? "test-bypass" : null);

      if (!recaptchaToken) {
        setError("CAPTCHA verification failed. Please try again.");
        return;
      }

      const response = await submitNewsletterForm({ ...formData, recaptchaToken });

      if (response.ok) {
        setSubmitted(true);
        recaptchaRef.current?.reset();

      } else {
        setError("Something went wrong. Please try again.");
        recaptchaRef.current?.reset();

      }
    } catch {
      setError("Something went wrong. Please try again.");
      recaptchaRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="section"
      sx={{
        display: "flex",
        alignItems: "center",
        textAlign: "left",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Typography variant="h2" textAlign={"center"} gutterBottom>
          Stay in touch!
        </Typography>
        <Typography variant="body1" textAlign={"center"} sx={{ mb: 3 }}>
          Sign up for email updates, and be the first to know about hair and makeup artists
          recommended by the Asian wedding community. We promise not to spam you.
        </Typography>

        {submitted ? (
          <Alert severity="success">Thank you for being part of our community!</Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Email and Submit Button on the Same Line */}
            {error && <Alert severity="error">{error}</Alert>}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                label="Your Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                fullWidth
              />
              <ReCaptcha
                ref={recaptchaRef}
                size="invisible"
                onExpired={() => console.warn("reCAPTCHA expired")}
                onErrored={() => console.warn("reCAPTCHA errored")}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ flexShrink: 0 }}
                disabled={isSubmitting}
              >
                Sign up
              </Button>
            </Box>

            {/* <Typography variant="subtitle1">I am interested in...</Typography> */}
            {/* <FormGroup sx={{ display: "flex", alignItems: "left" }}>
              {reasons.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={formData.reasons.includes(option.value)}
                      onChange={() => handleCheckboxChange(option.value)}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup> */}


          </Box>
        )}
      </Container>
    </Box>
  );
}
