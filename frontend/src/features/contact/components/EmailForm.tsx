"use client";

import { useState } from "react";
import { TextField, MenuItem, Button, Box, Alert } from "@mui/material";

export function EmailForm() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    reason: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const reasons = [
    { value: "general", label: "General Inquiry" },
    { value: "recommend", label: "Recommend a Vendor" },
    { value: "edit", label: "Update or Remove My Listing" },
  ];

  const handleChange = (e: { target: { name: string; value: string; }; }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

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
          Thank you! We&apos;ll get back to you soon.
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
            {reasons.map((option) => (
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
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Submit
          </Button>
        </Box>
      )}
    </>
  );
}
