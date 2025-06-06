"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import NextLink from "next/link";
import { login } from "../api/actions";
import { useNotification } from "@/contexts/NotificationContext";

export function LoginForm() {
  const { addNotification } = useNotification();
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsSubmitting(true);

    try {
      const result = await login(formData);
      if (result && result.action === 'verify-email') {
        setVerificationNeeded(true);
        return;
      }

      if (result && result.error) {
        addNotification(result.error, 'error');
        return;
      }
      
      addNotification('Logged in successfully!');
      window.location.href = '/';
    } catch (error) {
      console.error("An unexpected error occurred: " + error);
      addNotification('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Login
          </Typography>
          
          {verificationNeeded && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Your email is not verified. Please check your inbox and follow the verification link.
              <Box mt={1}>
                <Button
                  size="small"
                  component={NextLink}
                  href="/auth/verify-email"
                >
                  Get a new verification link
                </Button>
              </Box>
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
              disabled={isSubmitting}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              variant="outlined"
              disabled={isSubmitting}
            />

            <Stack spacing={2} direction="column" sx={{ mt: 3 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Log In'}
              </Button>

              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Don&apos;t have an account?{' '}
                <Link component={NextLink} href="/signup">
                  Sign up
                </Link>
              </Typography>
              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Forgot your password?{' '}
                <Link component={NextLink} href="/forgot-password">
                  Reset your password
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}