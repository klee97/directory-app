"use client";

import { useState } from 'react';
import { Box, Button, TextField, CircularProgress, Alert } from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import { useNotification } from '@/contexts/NotificationContext';

export function ResendVerificationForm() {
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
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) {
        addNotification(error.message || 'Failed to send verification email', 'error');
      } else {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("An unexpected error occurred: " + error);
      addNotification('An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {isSuccess ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Verification email has been sent! Please check your inbox and spam folder.
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
              {isSubmitting ? 'Sending...' : 'Send New Verification Email'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
} 