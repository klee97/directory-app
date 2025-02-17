"use client";

import { useState } from "react";
import { TextField, Button, Box, Alert, MenuItem } from "@mui/material";
import { submitNewsletterForm } from "../api/submitForm";

export function NewsletterForm() {
  const [formData, setFormData] = useState({
    email: "",
    reason: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const reasons = [
    { value: "updates", label: "Updates to the directory project" },
    { value: "featured", label: "New and Featured vendors" },
    { value: "help", label: "Opportunities to get involved" },
    { value: "all", label: "All of the above!" },
  ];

  const handleChange = (e: { target: { name: string; value: string; }; }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
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
    <>
      {submitted ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          Thank you for subscribing!
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
            label="What are you interested in hearing about?"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          >
            {reasons.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </Box>
      )}
    </>
  );
}
