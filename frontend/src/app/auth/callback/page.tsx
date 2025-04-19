"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Container, Paper, Typography } from "@mui/material";
import { createClient } from "@/lib/supabase/client";
import { useNotification } from "@/contexts/NotificationContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [message, setMessage] = useState("Processing authentication...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      // Get the search params from the URL
      const searchParams = new URLSearchParams(window.location.search);
      const type = searchParams.get('type');
      const errorCode = searchParams.get('error_code');

      if (errorCode === 'otp_expired') {
        setIsError(true);
        setMessage("The verification link has expired. Please request a new one.");
        setTimeout(() => {
          router.push("/auth/verify-email");
        }, 2000);
        return;
      }



      if (type === 'signup') {
        // email is successfully verified
        setMessage("Email is verified! Redirecting to homepage...");

        // Redirect to homepage after 2 seconds
        setTimeout(() => {
          router.push("/");
        }, 2000);
        return;
      }

      const { data: { user }, error } = await supabase.auth.getUser();

      // If we have a session, redirect to home
      if (user) {
        setMessage("Authentication successful! Redirecting to homepage...");
        setTimeout(() => {
          router.push("/");
        }, 2000);
        return;
      }

      if (error) {
        setIsError(true);
        setMessage("Authentication error: " + error.message);

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/");
        }, 2000);
        return;
      }

      // If no session and no specific error, show a generic message
      setIsError(true);
      setMessage("Authentication failed. Redirecting to homepage... ");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    };

    handleCallback();
  }, [router, addNotification]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
            }}
          >
            {!isError && <CircularProgress sx={{ mb: 3 }} />}
            <Typography
              variant="h5"
              component="h1"
              align="center"
              gutterBottom
              color={isError ? "error" : "primary"}
            >
              {message}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 