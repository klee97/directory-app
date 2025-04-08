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
} from '@mui/material';
import { signup } from '../api/actions';
import { toast } from 'react-hot-toast';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';

export function SignupForm() {
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const loadingToast = toast.loading('Creating your account...');

    try {
      const result = await signup(formData);
      
      if (result && result.error) {
        toast.dismiss(loadingToast);
        toast.error(result.error);
        return;
      }
      
      if (result && result.success) {
        toast.dismiss(loadingToast);
        toast.success('Account created successfully!');
        // Use setTimeout to ensure the toast is visible before redirecting
        setTimeout(() => {
          router.push('/auth/verify-email');
        }, 1000);
        return;
      }
      
      toast.dismiss(loadingToast);
      toast.success('Account created successfully! Please check your email to verify your account.');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Create Account
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
              helperText="Password must be at least 6 characters long"
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
            />

            <Stack spacing={2} direction="column" sx={{ mt: 3 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
              >
                Sign Up
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