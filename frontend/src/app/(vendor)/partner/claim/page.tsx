"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { verifyVendorMagicLink } from "@/features/profile/common/api/magicLink";
import { signUpAndClaimVendor } from "@/features/profile/manage/hooks/claimVendor";
import { useNotification } from "@/contexts/NotificationContext";
import { EMAIL_PARAM, SLUG_PARAM, TOKEN_PARAM } from "@/lib/constants";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { ReCaptchaRef } from "@/components/security/ReCaptcha";

function VendorClaimPageContent() {
  const { addNotification } = useNotification();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const recaptchaRef = useRef<ReCaptchaRef>(null);

  // Extract magic link parameters
  const slug = searchParams?.get(SLUG_PARAM) || "";
  const email = searchParams?.get(EMAIL_PARAM) || "";
  const token = searchParams?.get(TOKEN_PARAM) || "";

  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [vendorInfo, setVendorInfo] = useState<{ name: string; email: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Form fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Initialize page: verify token → load vendor info
  useEffect(() => {

    const init = async () => {
      if (process.env.NEXT_PUBLIC_FEATURE_VENDOR_LOGIN_ENABLED !== 'true') {
        router.push(`/`);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        console.log("User is already logged in");
        // User is already logged in, redirect to settings page
        router.push(`/partner/manage`);
        return;
      }

      const areAllParamsValid = !!email && !!token && email.trim() !== "" && token.trim() !== "" && slug.trim() !== "";

      if (!areAllParamsValid) {
        // Email, token, or slug is missing, show the login form
        setIsLoading(false);
        router.push(`/partner/login`);
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
      const verification = await verifyVendorMagicLink(slug, email, token);

      if (!verification.success) {
        setErrorMessage("Invalid or expired vendor claim link.");
      } else {
        setVendorInfo({
          name: verification.vendorBusinessName || "Your Vendor",
          email: verification.vendorEmail || "",
        });
      }

      setIsLoading(false);
    };

    init();
  }, [token, email, slug, router, supabase.auth]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setErrorMessage("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!vendorInfo?.email) {
      setErrorMessage("Missing vendor email.");
      return;
    }

    setIsClaiming(true);
    setErrorMessage("");

    try {
      const result = await signUpAndClaimVendor(vendorInfo.email, token, password);

      if (!result.success) {
        setErrorMessage(result.error || "Failed to claim vendor.");
        setIsClaiming(false);
        return;
      }

      // Sign in automatically
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: vendorInfo.email,
        password,
      });

      if (signInError) {
        setErrorMessage("Account created, but sign-in failed. Please sign in manually.");
        setIsClaiming(false);
        return;
      }

      addNotification("Welcome! Your vendor account has been created.");
      router.push("/partner/manage");
    } catch {
      setErrorMessage("Failed to claim business profile. Please try again.");
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (errorMessage && !vendorInfo) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Alert severity="error">{errorMessage}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Claim Your Vendor Profile
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              To claim your profile, set a password for your account below. You can update your email once your account is created.
            </Typography>

            <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: "grey.50" }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Business Found:
              </Typography>
              <Typography variant="h6">
                <strong>{vendorInfo?.name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Account Email: {vendorInfo?.email}
              </Typography>
            </Box>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={handleClaim}>
              {/* Password */}
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 1.5 }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),

                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                Must be at least 8 characters.
              </Typography>

              {/* Confirm Password */}
              <TextField
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ mb: 3 }}
              />

              {/* Submit */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isClaiming}
              >
                {isClaiming ? <CircularProgress size={24} /> : "Create Account & Claim Profile"}
              </Button>
            </form>

            {/* Sign-in alternative */}
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body2">
                Already have an account?{" "}
                <Button variant="text" onClick={() => router.push("/partner/login")} sx={{ p: 0 }}>
                  Sign in instead
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>

      </Box>
    </Container>
  );
}

export default function VendorClaimPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VendorClaimPageContent />
    </Suspense>
  );
}
