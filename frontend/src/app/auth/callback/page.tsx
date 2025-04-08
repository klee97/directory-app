"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Container, Paper, Typography } from "@mui/material";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Processing authentication...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.getSession();

      // Get the hash from the URL
      const hash = window.location.hash;

      if (error) {
        setIsError(true);
        setMessage("Authentication error: " + error.message);
        toast.error("Authentication failed: " + error.message);
        return;
      }

      // If this was an email verification
      if (hash && hash.includes("type=signup")) {
        toast.success("Email verified successfully! You can now log in with your account.");
        setMessage("Email verified successfully!");
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        return;
      }

      // For other auth operations
      toast.success("Authentication successful!");
      setMessage("Authentication successful!");
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    };

    handleCallback();
  }, [router]);

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