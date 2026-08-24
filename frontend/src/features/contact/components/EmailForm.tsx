"use client";

import { useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { submitForm } from "@/features/contact/api/submitForm";
import ReCaptcha, { ReCaptchaRef } from "@/components/security/ReCaptcha";
import { isDevOrPreview } from "@/lib/env/env";

export enum ContactReason {
  GENERAL = "general",
  RECOMMEND = "recommend",
  CLAIM = "claim",
  EDIT = "edit",
}

export const CONTACT_REASONS: { value: ContactReason; label: string }[] = [
  { value: ContactReason.GENERAL, label: "General Inquiry" },
  { value: ContactReason.RECOMMEND, label: "Recommend a Vendor" },
  { value: ContactReason.CLAIM, label: "Claim a Listing" },
  { value: ContactReason.EDIT, label: "Update or Remove My Listing" },
];

export function isContactReason(value: string | undefined): value is ContactReason {
  return Object.values(ContactReason).includes(value as ContactReason);
}

export function EmailForm({ reason }: { reason?: string }) {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    reason: isContactReason(reason) ? reason : "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef<ReCaptchaRef>(null);

  const handleChange = (e: { target: { name: string; value: string; }; }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
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

      const response = await submitForm({ ...formData, recaptchaToken });

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
    <>
      {submitted ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          Thank you! We&apos;ll get back to you soon.
        </Alert>
      ) : (
        <Box component="form" data-testid="email-form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="First Name"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Last Name"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Your Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Reason for Contacting"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          >
            {CONTACT_REASONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Message"
            name="message"
            multiline
            rows={4}
            value={formData.message}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      )}
    </>
  );
}
