"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useEffect, useRef, useState } from "react";
import { verifyVendorMagicLink } from "@/features/profile/common/api/magicLink";
import ReCaptcha, { ReCaptchaRef } from "@/components/security/ReCaptcha";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import AlreadyLoggedIn from "@/features/vendorClaim/components/VendorLoggedIn";
import BusinessStrip from "@/components/ui/BusinessStrip";
import VendorClaimError, { ErrorType, ErrorTypes } from "@/features/vendorClaim/components/VendorClaimError";
import VendorClaimForm from "@/features/vendorClaim/components/VendorClaimForm";
import VendorClaimPerks from "@/features/vendorClaim/components/VendorClaimPerks";
import { Divider } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { createBrowserClient } from "@/lib/supabase/clients/browserClient";

const supabaseBrowserClient = createBrowserClient();

/**
 * The page's whole verdict, replaced wholesale by each verification run.
 *
 * Previously these were four independent useStates, and a run that ended in
 * success left an earlier run's `errorType` behind — the render checks the
 * error first, so the stale failure won. Making the states mutually exclusive
 * removes that possibility rather than papering over it with resets.
 */
type ClaimState =
  | { status: "loading" }
  | { status: "loggedIn"; email: string }
  | { status: "error"; errorType: ErrorType; hasEmailOnFile: boolean; isClaimed: boolean }
  | { status: "ready"; vendorInfo: { name: string; email: string } };

const LOADING: ClaimState = { status: "loading" };

interface VendorClaimContentProps {
  /** Magic-link params, read server-side so they are never transiently empty. */
  slug: string;
  email: string;
  token: string;
}

export default function VendorClaimContent({ slug, email, token }: VendorClaimContentProps) {
  const { isLoggedIn, isLoading: isAuthLoading, user } = useAuth();

  const recaptchaRef = useRef<ReCaptchaRef>(null);

  const [state, setState] = useState<ClaimState>(LOADING);

  // Initialize page: verify token → load vendor info
  useEffect(() => {
    // A rerun supersedes whatever is in flight, so a slow earlier run can't
    // land its verdict on top of a newer one.
    let isCurrent = true;
    const settle = (next: ClaimState) => {
      if (isCurrent) setState(next);
    };

    const init = async () => {
      // Wait for auth context to resolve first
      if (isAuthLoading) return;

      if (isLoggedIn) {
        settle({ status: "loggedIn", email: user?.email ?? "" });
        return;
      }

      const areAllParamsValid = !!email && !!token && email.trim() !== "" && token.trim() !== "" && slug.trim() !== "";

      if (!areAllParamsValid) {
        settle({
          status: "error",
          errorType: ErrorTypes.MissingParams,
          hasEmailOnFile: false,
          isClaimed: false,
        });
        return;
      }

      // Falls back to the dev/preview bypass token when no site key is
      // configured locally (see verifyRecaptchaToken), matching how
      // ManageProfilePrompt requests a link.
      const recaptchaToken = (await recaptchaRef.current?.executeAsync()) ?? "test-bypass";
      recaptchaRef.current?.reset();

      // Verify the magic link by comparing params to database record
      const verification = await verifyVendorMagicLink(slug, email, token, recaptchaToken);

      if (verification.success) {
        settle({
          status: "ready",
          vendorInfo: {
            name: verification.vendorBusinessName || "Your Vendor",
            email: verification.vendorEmail || "",
          },
        });
        return;
      }

      // Invalid and expired are deliberately indistinguishable here — the
      // error page's copy covers both. A failed bot check is its own thing:
      // the link may be perfectly good, so offer a retry instead.
      settle({
        status: "error",
        errorType: verification.recaptchaFailed
          ? ErrorTypes.RecaptchaFailed
          : ErrorTypes.InvalidLink,
        hasEmailOnFile: verification.hasEmailOnFile,
        isClaimed: verification.isClaimed,
      });
    };

    init();

    return () => {
      isCurrent = false;
    };
  }, [token, email, slug, isLoggedIn, isAuthLoading, user]);

  const handleSignOut = async () => {
    setState(LOADING);
    // No reload: the params are props now, so the effect reruns on the auth
    // change and verifies the link in place.
    await supabaseBrowserClient.auth.signOut();
  };

  // ── Body ─────────────────────────────────────────────────────────────────
  // Assigned rather than returned early so the reCAPTCHA widget below stays
  // mounted in every state. It has to exist before the effect runs, or
  // `recaptchaRef.current` is null and executeAsync() silently no-ops — which
  // is how this page ended up with no bot check at all.
  let body;

  if (state.status === "loading") {
    body = (
      <Box sx={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress size={28} />
      </Box>
    );
  } else if (state.status === "loggedIn") {
    body = (
      <Box sx={{ mt: 8, mb: 6 }}>
        <AlreadyLoggedIn email={state.email} onSignOut={handleSignOut} />
      </Box>
    );
  } else {
    const isError = state.status === "error";
    body = (
      <Box sx={{ my: 8 }}>
        <Card variant="outlined" sx={{ overflow: "hidden", bgcolor: "background.default", pt: 2 }}>

          {/* Header */}
          <Box sx={{ px: 6, pt: 2, pb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="h2" sx={{ fontWeight: 500, mb: 0.75, lineHeight: 1.3 }}>
              {isError ? "Something went wrong" : "Almost there!"}
            </Typography>
            {!isError &&
              <Typography variant="h4" sx={{ fontWeight: 500, mb: 0.75, lineHeight: 1.3 }}>
                Create a password to manage your artist profile.
              </Typography>
            }

          </Box>

          {/* Business strip — only shown when we have vendor info */}
          {state.status === "ready" && (
            <BusinessStrip name={state.vendorInfo.name} email={state.vendorInfo.email} />
          )}

          {/* Body */}
          {state.status === "error" ? (
            <CardContent sx={{ px: 8, py: 3 }}>
              <VendorClaimError
                errorType={state.errorType}
                slug={slug}
                hasEmailOnFile={state.hasEmailOnFile}
                isClaimed={state.isClaimed}
              />
            </CardContent>
          ) : (
            <>
              <CardContent sx={{ px: 8, py: 3 }}>
                <VendorClaimPerks />
              </CardContent>
              <Divider />
              <CardContent sx={{ px: 8, py: 3 }}>
                <VendorClaimForm vendorInfo={state.vendorInfo} token={token} />
              </CardContent>
            </>
          )}

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
    );
  }

  return (
    <Container maxWidth="sm">
      {body}
      <ReCaptcha ref={recaptchaRef} />
    </Container>
  );
}
