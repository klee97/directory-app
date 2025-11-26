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
import { claimVendor } from "@/features/profile/manage/hooks/claimVendor";
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

      // Sign up the user (creates account + session)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: generateSecurePassword(), // Random password they won't use
        options: {
          data: {
            has_password: false,
            email_context: 'initial_verification'
          },
          emailRedirectTo: `${window.location.origin}/partner/manage`
        }
      });

      if (signUpError) {
        // Email already exists - send magic link instead
        if (signUpError.message.includes('already registered')) {
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

          addNotification("An account with this email already exists. Check your email for a sign-in link to complete claiming your vendor.");
          setIsLoading(false);
          return;
        }

        setErrorMessage("Failed to create account: " + signUpError.message);
        setIsLoading(false);
        return;
      }

      // Auto-confirm email since they clicked the magic link
      if (!signUpData.user) {
        setErrorMessage("Failed to create user account.");
        setIsLoading(false);
        return;
      }

      // Claim the vendor for this new user
      try {
        await claimVendor(verification.vendorAccessToken, true); // autoConfirm = true
        console.log("Vendor claimed successfully for user ID: " + signUpData.user.id);

        router.push(`/partner/manage`);
        addNotification("Welcome! Your vendor account has been created. Please check your email to enable magic link sign-in for future visits.");
      } catch (claimError) {
        console.error("Error claiming vendor: " + (claimError as Error).message);
        setErrorMessage("Account created but failed to claim vendor: " + (claimError as Error).message);
        setIsLoading(false);
      }
    };

    handleVendorClaim();
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
    </Suspense>)
    ;
};

function generateSecurePassword(length: number = 32): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|:;<>?,./';
  
  const allChars = lowercase + uppercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one of each required character type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to randomize position of guaranteed characters
  return password.split('').sort(() => Math.random() - 0.5).join('');
}