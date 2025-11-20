"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoginForm } from "@/features/login/components/LoginForm";
import { fetchVendorBySlug } from "@/features/profile/common/api/fetchVendor";
import { ReCaptchaRef } from '@/components/security/ReCaptcha';
import { useNotification } from "@/contexts/NotificationContext";
import { SLUG_PARAM, EMAIL_PARAM, TOKEN_PARAM } from "@/lib/constants";

function VendorLoginPageContent() {
  const { addNotification } = useNotification();
  const searchParams = useSearchParams();
  const router = useRouter();
  const recaptchaRef = useRef<ReCaptchaRef>(null);

  // Extract magic link parameters
  const slug = searchParams?.get(SLUG_PARAM) || "";
  const email = searchParams?.get(EMAIL_PARAM) || "";
  const token = searchParams?.get(TOKEN_PARAM) || "";

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_FEATURE_VENDOR_LOGIN_ENABLED !== 'true') {
      router.push(`/`);
      return;
    }

    // Check if user is already logged in
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        console.log("User is already logged in");
        // User is already logged in, redirect to settings page
        router.push(`/partner/settings`);
        return;
      }

      const areAllParamsValid = !!email && !!token && email.trim() !== "" && token.trim() !== "" && slug.trim() !== "";

      if (!areAllParamsValid) {
        // Email, token, or slug is missing, show the login form
        setIsLoading(false);
        return;
      }

      // Execute reCAPTCHA and get token
      try {
        await recaptchaRef.current?.executeAsync();
        console.log("reCAPTCHA executed successfully");
      } catch (error) {
        console.error("Error executing reCAPTCHA: ", error);
        setIsLoading(false);
        return;
      }

      // Check if email and token from the query parameters are valid and match database records. 
      // If they do, sign in the user anonymously and link their email to the account.
      const vendor = await fetchVendorBySlug(slug);
      const doEmailAndTokenMatch = email.toLowerCase() === vendor?.email?.toLowerCase() && token.toLowerCase() === vendor?.access_token?.toLowerCase();

      if (doEmailAndTokenMatch) {
        // Sign in the user anonymously and link email
        const { error } = await supabase.auth.signInAnonymously()
        if (error) {
          console.error("Error signing in anonymously: " + error.message);
          setIsLoading(false);
          return;
        }

        const { data: updateEmailData, error: updateEmailError } = await supabase.auth.updateUser({
          email,
          data: {
            access_token: token,
            has_password: 'false'
          }
        })

        if (updateEmailError) {
          console.error("Error updating user email: " + updateEmailError.message);
          setIsLoading(false);
          return;
        }
        console.log("Successfully logged in and updated user email for user ID: " + updateEmailData.user?.id);
        router.push(`/partner/settings`);
        addNotification("Check your inbox to verify your vendor email address: " + email);
      } else {
        // User email and token do not match or user's email has already been linked, show the login form
        setIsLoading(false);
      }
    };

    checkSession();
  }, [addNotification, email, router, slug, token]);

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
      <LoginForm />
    </Container>
  );
}

export default function VendorLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VendorLoginPageContent />
    </Suspense>)
    ;
};