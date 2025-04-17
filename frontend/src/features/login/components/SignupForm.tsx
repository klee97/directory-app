"use client";
import React from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Stack,
  Link,
  Alert,
} from '@mui/material';
import { signup } from '../api/actions';
import { useNotification } from '@/contexts/NotificationContext';
import { validatePassword } from '@/utils/passwordValidation';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

export function SignupForm() {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    setIsSubmitting(true);
    setPasswordError(null);

    if (password !== confirmPassword) {
      addNotification('Passwords do not match', 'error');
      setIsSubmitting(false);
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      setPasswordError(validation.message);
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await signup(formData);
      console.log(result);
      if (result && result.error) {
        addNotification(result.error, 'error');
        if (result.action === 'login') {
          router.push('/login');
        } else if (result.action === 'verify-email') {
          router.push('/auth/verify-email');
        }
        return;
      }
      
      router.push('/auth/verify-email');
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
            Sign Up
          </Typography>

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
              autoComplete="new-password"
              variant="outlined"
              disabled={isSubmitting}
              error={!!passwordError}
              helperText={passwordError}
              onChange={() => setPasswordError(null)}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              variant="outlined"
              disabled={isSubmitting}
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              Password must contain:
              <ul>
                <li>At least 8 characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one lowercase letter</li>
                <li>At least one number</li>
                <li>At least one special character: {'!@#$%^&*(),.?'}</li>
              </ul>
            </Alert>

            <Stack spacing={2} direction="column" sx={{ mt: 3 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : 'Sign Up'}
              </Button>

              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Already have an account?{' '}
                <Link component={NextLink} href="/login">
                  Log in
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 