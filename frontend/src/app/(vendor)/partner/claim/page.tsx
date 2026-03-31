"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { verifyVendorMagicLink } from "@/features/profile/common/api/magicLink";
import { EMAIL_PARAM, SLUG_PARAM, TOKEN_PARAM } from "@/lib/constants";
import { ReCaptchaRef } from "@/components/security/ReCaptcha";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import { Session } from "@supabase/supabase-js";
import AlreadyLoggedIn from "@/features/vendorClaim/components/VendorLoggedIn";
import BusinessStrip from "@/components/ui/BusinessStrip";
import VendorClaimError, { ErrorType } from "@/features/vendorClaim/components/VendorClaimError";
import VendorClaimForm from "@/features/vendorClaim/components/VendorClaimForm";
import VendorClaimPerks from "@/features/vendorClaim/components/VendorClaimPerks";
import { Divider } from "@mui/material";

function VendorClaimPageContent() {
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
  const [vendorInfo, setVendorInfo] = useState<{ name: string; email: string } | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(null);

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
        console.debug("reCAPTCHA executed successfully");
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

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress size={28} />
        </Box>
      </Container>
    );
  }

  // ── Already logged in ────────────────────────────────────────────────────
  if (existingSession) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 6 }}>
          <AlreadyLoggedIn session={existingSession} onSignOut={handleSignOutAndReload} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 8 }}>
        <Card variant="outlined" sx={{ overflow: "hidden", bgcolor: "background.default", pt: 2 }}>

          {/* Header */}
          <Box sx={{ px: 6, pt: 3, pb: 3, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="h2" sx={{ fontWeight: 500, mb: 0.75, lineHeight: 1.3 }}>
              {errorType ? "Something went wrong" : "Your profile is ready to claim"}
            </Typography>

          </Box>

          {/* Business strip — only shown when we have vendor info */}
          {vendorInfo && <BusinessStrip name={vendorInfo.name} email={vendorInfo.email} />}

          {/* Body */}
          {errorType ? (
            <CardContent sx={{ px: 8, py: 3 }}>
              <VendorClaimError errorType={errorType} />
            </CardContent>
          ) : vendorInfo ? (
            <>
              <CardContent sx={{ px: 8, py: 3 }}>
                <VendorClaimPerks />
              </CardContent>
              <Divider />
              <CardContent sx={{ px: 8, py: 3 }}>
                <VendorClaimForm vendorInfo={vendorInfo} token={token} />
              </CardContent>
            </>
          ) : null}

          {/* Footer */}
          <Box
            sx={{
              px: 3,
              py: 1.5,
              borderTop: "1px solid",
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <Typography variant="body2">
              Already have an account?{" "}
              <Link
                component={NextLink}
                href="/partner/login"
                underline="hover"
                sx={{ color: "text.primary" }}
              >
                Log in
              </Link>
            </Typography>
          </Box>
        </Card>
      </Box>
    </Container >
  );
}

export default function VendorClaimPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Box sx={{ bgcolor: "background.back", minHeight: "100vh", display: "flex" }}>
        <VendorClaimPageContent />
      </Box>
    </Suspense>
  );
}