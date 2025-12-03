"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoginForm } from "@/features/login/components/LoginForm";
import { verifyVendorMagicLink } from "@/features/profile/common/api/fetchVendor";
import { ReCaptchaRef } from '@/components/security/ReCaptcha';
import { useNotification } from "@/contexts/NotificationContext";
import { SLUG_PARAM, EMAIL_PARAM, TOKEN_PARAM } from "@/lib/constants";
import { signUpAndClaimVendor } from "@/features/profile/manage/hooks/claimVendor";
import Alert from "@mui/material/Alert";

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
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_FEATURE_VENDOR_LOGIN_ENABLED !== 'true') {
      router.push(`/`);
      return;
    }

    const handleVendorClaim = async () => {
      const supabase = createClient();

      // Check if user is already logged in
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        console.log("User is already logged in");
        router.push(`/partner/manage`);
        return;
      }

      const areAllParamsValid = !!email && !!token && !!slug &&
        email.trim() !== "" && token.trim() !== "" && slug.trim() !== "";

      if (!areAllParamsValid) {
        setIsLoading(false);
        return;
      }

      // Execute reCAPTCHA
      try {
        await recaptchaRef.current?.executeAsync();
        console.log("reCAPTCHA executed successfully");
      } catch (error) {
        console.error("Error executing reCAPTCHA: ", error);
        setErrorMessage("Security verification failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Verify the magic link
      const verification = await verifyVendorMagicLink(slug, email, token);

      if (!verification.success || !verification.vendorAccessToken) {
        setErrorMessage("Invalid or expired magic link. Please request a new one.");
        setIsLoading(false);
        return;
      }

      // Use server action to create user and claim vendor atomically
      const result = await signUpAndClaimVendor(email, verification.vendorAccessToken);

      if (!result.success) {
        // Handle different error cases
        if (result.type === 'email_exists' || result.type === 'already_claimed') {
          // Send OTP for existing user
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email,
            options: {
              data: {
                pending_vendor_access_token: verification.vendorAccessToken
              },
              emailRedirectTo: `${window.location.origin}/partner/claim/complete`
            }
          });

          if (otpError) {
            setErrorMessage("Failed to send sign-in link. Please try again.");
            setIsLoading(false);
            return;
          }

          addNotification(result.type === 'email_exists'
            ? "An account with this email already exists. Check your email for a sign-in link to complete claiming your vendor."
            : "This vendor is already claimed. Check your email for a sign-in link.");
          setIsLoading(false);
          return;
        }

        setErrorMessage(result.error || "Failed to create account");
        setIsLoading(false);
        return;
      }

      // Success! User created and vendor claimed
      // The server action created a session via signUp() - verify it's accessible
      console.log("User created and vendor claimed, verifying session");

      // Refresh the session to ensure client has the latest state
      await supabase.auth.refreshSession();

      const { data: { session: newSession } } = await supabase.auth.getSession();

      if (!newSession) {
        // Session didn't propagate from server - fallback to OTP
        console.warn("Session not found after signup, sending OTP as fallback");

        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/partner/manage`
          }
        });

        if (otpError) {
          setErrorMessage("Account created but failed to sign in. Please try signing in manually.");
          setIsLoading(false);
          return;
        }

        addNotification("Your vendor account has been created. Check your email for a sign-in link.");
        setIsLoading(false);
        return;
      }

      console.log("Session verified, redirecting to dashboard");
      router.push('/partner/manage');
      addNotification("Welcome! Your vendor account has been created and you're now signed in.");
    };

    handleVendorClaim();
  }, [addNotification, email, router, slug, token]);

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            gap: 2
          }}
        >
          <CircularProgress />
          <Typography>Setting up your vendor account...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <br />
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      <Typography variant="h1" gutterBottom sx={{ mt: 2 }}>
        Vendor Login
      </Typography>
      <LoginForm isVendorLogin={true} />
    </Container>
  );
}

export default function VendorLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VendorLoginPageContent />
    </Suspense>
  );
}