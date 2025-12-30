"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useNotification } from "@/contexts/NotificationContext";
import { requestPasswordReset } from "@/features/login/api/actions";

interface ForgotPasswordFormProps {
  isVendorSite?: boolean;
}

export function ForgotPasswordForm({ isVendorSite = false }: ForgotPasswordFormProps) {
  const { addNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addNotification('Please enter your email address', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await requestPasswordReset(email, isVendorSite);
      setIsSuccess(true);
    } catch (error) {
      console.error("An unexpected error occurred: " + error);
      addNotification('An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Reset Password
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {isSuccess ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                If we find an account associated with that email, you&apos;ll receive a password reset link shortly.
              </Alert>
            ) : (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Link to Email'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 