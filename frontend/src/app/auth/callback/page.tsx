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
      const { data: { session }, error } = await supabase.auth.getSession();

      // Get the hash and search params from the URL
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      const errorCode = searchParams.get('error_code');

      if (errorCode === 'otp_expired') {
        setIsError(true);
        setMessage("Verification link has expired");
        addNotification("The verification link has expired. Please request a new one.", "error");
        setTimeout(() => {
          router.push("/auth/resend-verification");
        }, 2000);
        return;
      }

      if (error) {
        setIsError(true);
        setMessage("Authentication error: " + error.message);
        addNotification("Authentication failed: " + error.message, "error");
        return;
      }

      // If this was an email verification
      if (hash && hash.includes("type=signup")) {
        addNotification("Email verified successfully! You can now log in with your account.");
        setMessage("Email verified successfully!");
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        return;
      }

      // If we have a session, redirect to home
      if (session) {
        setMessage("Authentication successful!");
        setTimeout(() => {
          router.push("/");
        }, 2000);
        return;
      }

      // If no session and no specific error, show a generic message
      setMessage("Processing authentication...");
      setTimeout(() => {
        router.push("/login");
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