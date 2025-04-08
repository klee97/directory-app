"use client";

import { Box, Button, Container, Paper, TextField, Typography, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    const loadingToast = toast.loading('Sending verification email...');
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      toast.dismiss(loadingToast);
      
      if (error) {
        toast.error(error.message || 'Failed to send verification email');
      } else {
        toast.success('Verification email sent! Please check your inbox');
        setIsSuccess(true);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Resend Verification Email
          </Typography>
          
          {isSuccess ? (
            <Box textAlign="center" my={4}>
              <Typography variant="body1" paragraph>
                Verification email has been sent! Please check your inbox and spam folder.
              </Typography>
              <Button component={Link} href="/login" variant="contained">
                Return to Login
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Typography variant="body1" paragraph>
                Enter your email address to receive a new verification link.
              </Typography>
              
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
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {isSubmitting ? 'Sending...' : 'Send Verification Email'}
                </Button>
              </Box>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button component={Link} href="/login" variant="text">
                  Back to Login
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 