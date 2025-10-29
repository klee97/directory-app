"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { VendorLoginForm } from "@/features/login/components/VendorLoginForm";

export default function VendorLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  // TODO: Replace with actual email and uuid from magic link query parameters
  const email = "ivymalao+102925@gmail.com";
  const uuid = "uuid-1234";

  // TODO: add invisible google recaptcha v3 to prevent abuse

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        console.log("User is already logged in");
        // User is already logged in, redirect to vendor page
        router.push('/vendors/mable-pang');
      } else if (email && uuid) {
        // Sign in the user anonymously and link email
        const { data, error } = await supabase.auth.signInAnonymously()
        if (error) {
          console.error("Error signing in anonymously: " + error.message);
          setIsLoading(false);
          return;
        }

        const { data: updateEmailData, error: updateEmailError } = await supabase.auth.updateUser({
          email,
        })

        if (updateEmailError) {
          console.error("Error updating user email: " + updateEmailError.message);
          setIsLoading(false);
          return;
        }
        console.log("Successfully logged in and updated user email for user ID: " + updateEmailData.user?.id);
        router.push('/vendors/mable-pang');
      } else {
        // User email and uuid do not match or user's email has already been linked, show the login form
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

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
        Vendor Login
      </Typography>
      <VendorLoginForm />
    </Container>
  );
}
