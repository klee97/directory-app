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
import { validatePassword } from "@/utils/passwordValidation";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import { Session } from "@supabase/supabase-js";

type ErrorType =
  | "invalid_link"
  | "expired_link"
  | "missing_params"
  | "recaptcha_failed"
  | null;

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

  const [existingSession, setExistingSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [vendorInfo, setVendorInfo] = useState<{ name: string; email: string } | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [formError, setFormError] = useState("");

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
        setExistingSession(session);
        setIsLoading(false);
        return;
      }

      const areAllParamsValid = !!email && !!token && email.trim() !== "" && token.trim() !== "" && slug.trim() !== "";

      if (!areAllParamsValid) {
        setErrorType("missing_params");
        setIsLoading(false);
        return;
      }

      // Execute reCAPTCHA and get token
      try {
        await recaptchaRef.current?.executeAsync();
        console.log("reCAPTCHA executed successfully");
      } catch (error) {
        console.error("Error executing reCAPTCHA: ", error);
        setErrorType("recaptcha_failed");
        setIsLoading(false);
        return;
      }

      // Verify the magic link by comparing params to database record
      const verification = await verifyVendorMagicLink(slug, email, token);

      if (!verification.success) {
        // Determine if link is expired or invalid based on error message if available
        setErrorType("invalid_link");
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

  const handleSignOutAndReload = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // reload keeps magic link params
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setFormError("Please fill out all fields.");
      return;
    }

    // Validate password using existing function
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setFormError(passwordValidation.message);
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (!vendorInfo?.email) {
      setFormError("Missing vendor email.");
      return;
    }

    setIsClaiming(true);
    setFormError("");

    try {
      const result = await signUpAndClaimVendor(vendorInfo.email, token, password);

      if (!result.success) {
        setFormError(result.error || "Failed to claim vendor.");
        setIsClaiming(false);
        return;
      }

      // Sign in automatically
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: vendorInfo.email,
        password,
      });

      if (signInError) {
        setFormError("Account created, but sign-in failed. Please sign in manually.");
        setIsClaiming(false);
        return;
      }

      addNotification("Welcome! Your vendor account has been created.");
      router.push("/partner/manage");
    } catch {
      setFormError("Failed to claim business profile. Please try again.");
      setIsClaiming(false);
    }
  };

  const getErrorContent = (type: ErrorType) => {
    switch (type) {
      case "invalid_link":
        return {
          title: "Invalid Claim Link",
          message: "This claim link is invalid or has already been used. Each link can only be used once to claim a vendor profile.",
          actions: (
            <>
              <Button
                variant="contained"
                onClick={() => router.push("/partner/login")}
                fullWidth
                sx={{ mb: 1 }}
              >
                Go to Sign In
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push("/for-vendors")}
                fullWidth
              >
                Return to Home
              </Button>
            </>
          )
        };
      case "expired_link":
        return {
          title: "Expired Claim Link",
          message: "This claim link has expired. Claim links are valid for 24 hours after being sent.",
          actions: (
            <>
              <Button
                variant="contained"
                onClick={() => router.push("/partner/login")}
                fullWidth
                sx={{ mb: 1 }}
              >
                Request New Link
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push("/for-vendors")}
                fullWidth
              >
                Return to Home
              </Button>
            </>
          )
        };
      case "missing_params":
        return {
          title: "Incomplete Claim Link",
          message: "The claim link appears to be incomplete or incorrectly formatted. Please check that you've copied the entire link from your email.",
          actions: (
            <>
              <Button
                variant="contained"
                onClick={() => router.push("/partner/login")}
                fullWidth
                sx={{ mb: 1 }}
              >
                Go to Sign In
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push("/for-vendors")}
                fullWidth
              >
                Return to Home
              </Button>
            </>
          )
        };
      case "recaptcha_failed":
        return {
          title: "Security Verification Failed",
          message: "We couldn't verify your request. This might be due to a network issue or browser settings blocking security checks.",
          actions: (
            <>
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                fullWidth
                sx={{ mb: 1 }}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push("/partner/login")}
                fullWidth
              >
                Go to Sign In
              </Button>
            </>
          )
        };
      default:
        return null;
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

  if (existingSession) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h2" gutterBottom>
                You&apos;re already signed in
              </Typography>

              <Typography variant="body1" sx={{ mb: 2 }}>
                This claim link is for the vendor profile below. You&apos;re currently
                signed in as: <strong>{existingSession.user.email}</strong>
              </Typography>


              {vendorInfo && (
                <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: "grey.50" }}>
                  <Typography variant="subtitle2">
                    Vendor to be claimed
                  </Typography>
                  <Typography variant="body2">
                    <strong>{vendorInfo.name}</strong>
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Button
                  variant="contained"
                  onClick={() => router.push("/partner/manage")}
                  fullWidth
                >
                  Go to my profile
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleSignOutAndReload}
                  fullWidth
                >
                  Sign out
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  const errorContent = getErrorContent(errorType);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Card>
          <CardContent>
            <Typography variant="h2" gutterBottom>
              Claim Your Vendor Profile
            </Typography>

            {errorContent ? (
              <>
                <Alert severity="error" sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {errorContent.title}
                  </Typography>
                  <Typography variant="body2">
                    {errorContent.message}
                  </Typography>
                </Alert>

                <Box sx={{ mt: 3 }}>
                  {errorContent.actions}
                </Box>
              </>
            ) : (
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  You&apos;re almost set! Create a password below to make your account for managing your vendor profile.
                  You can change your email later if needed.
                </Typography>

                <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: "grey.50" }}>
                  <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                    Business Found:   <strong>
                      <Link
                        component={NextLink}
                        href={`/vendors/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                      >
                        {vendorInfo?.name}
                      </Link>
                    </strong>
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                    Email: <strong>{vendorInfo?.email}</strong>
                  </Typography>
                </Box>

                {formError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {formError}
                  </Alert>
                )}

                <Box component="div">
                  {/* Password */}
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleClaim(e);
                      }
                    }}
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
                    Must be at least 8 characters and include uppercase, lowercase, number, and special character.
                  </Typography>

                  {/* Confirm Password */}
                  <TextField
                    label="Confirm Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleClaim(e);
                      }
                    }}
                    sx={{ mb: 3 }}
                  />

                  {/* Submit */}
                  <Button
                    onClick={handleClaim}
                    variant="contained"
                    fullWidth
                    disabled={isClaiming}
                  >
                    {isClaiming ? <CircularProgress size={24} /> : "Create Account & Claim Profile"}
                  </Button>
                </Box>

                {/* Sign-in alternative */}
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography variant="body2">
                    Already have an account?{" "}
                    <Button variant="text" onClick={() => router.push("/partner/login")} sx={{ p: 0 }}>
                      Sign in instead
                    </Button>
                  </Typography>
                </Box>
              </>
            )}
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