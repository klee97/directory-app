"use client";

import { SignupForm } from "@/features/login/components/SignupForm";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SignupPageProps {
  title: string;
  redirectUrl: string;
}

export function SignupPage({ title, redirectUrl }: SignupPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // User is already logged in, redirect to appropriate page
        router.push(redirectUrl);
      } else {
        // User is not logged in, show the signup form
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router, redirectUrl]);

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh'
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <br />
      <Typography variant="h1" gutterBottom sx={{ mt: 2 }}>
        {title}
      </Typography>
      <SignupForm />
    </Container>
  );
}
