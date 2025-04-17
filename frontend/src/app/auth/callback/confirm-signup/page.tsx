'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Container, Typography, Box, Paper, CircularProgress } from '@mui/material';
import { createClient } from '@/lib/supabase/client';

function ConfirmSignUpContent() {
  const searchParams = useSearchParams();
  const confirmationUrl = searchParams.get('confirmation_url');
  const [isAlreadyAuthenticated, setIsAlreadyAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuthStatus = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAlreadyAuthenticated(true);
      }
    };

    checkAuthStatus();
  }, []);
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Confirm Sign Up
          </Typography>

          {isAlreadyAuthenticated ? (
            <>
              <Typography variant="body1" align="center" component={'p'}>
                You are already verified and signed in to your account.
              </Typography>

              <Button
                variant="contained"
                color="primary"
                href="/"
                size="large"
              >
                Go to Directory
              </Button>
            </>
          ) : (
            <>

              {confirmationUrl ? (
                <>
                  <Typography variant="body1" align="center" component={'p'}>
                    Please click the button below to verify your email address and set up your account.
                  </Typography>

                  <Button
                    variant="contained"
                    color="primary"
                    component="a"
                    href={confirmationUrl}
                    size="large"
                  >
                    Confirm Now
                  </Button>
                </>
              ) : (
                <Typography color="error">
                  There was an error verifying your email address. Please check the link and try again.
                </Typography>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

// A loading component to show while suspense is resolving
function LoadingState() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
      <CircularProgress />
    </Box>
  );
}

// Main page component with Suspense boundary
export default function ConfirmSignUpPage() {
  return (
    <Container maxWidth="md">
      <Suspense fallback={<LoadingState />}>
        <ConfirmSignUpContent />
      </Suspense>
    </Container>
  );
}