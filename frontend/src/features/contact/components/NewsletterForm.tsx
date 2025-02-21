"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Alert,
  Typography,
  Container,
} from "@mui/material";
import { submitNewsletterForm } from "../api/submitForm";

export function NewsletterForm() {
  const [formData, setFormData] = useState({
    email: "",
    reasons: [] as string[],
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // const reasons = [
  //   { value: "updates", label: "Updates to the directory project" },
  //   { value: "featured", label: "New and featured vendors" },
  //   { value: "help", label: "Opportunities to get involved" },
  // ];
  //
  // const handleCheckboxChange = (value: string) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     reasons: prev.reasons.includes(value)
  //       ? prev.reasons.filter((reason) => reason !== value)
  //       : [...prev.reasons, value],
  //   }));
  // };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);

    const response = await submitNewsletterForm(formData);

    if (response.ok) {
      setSubmitted(true);
    } else {
      setError("Something went wrong. Please try again.");
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

              <Button type="submit" variant="contained" color="primary" sx={{ flexShrink: 0 }}>
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
