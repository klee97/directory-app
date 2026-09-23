"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import ReCaptcha, { ReCaptchaRef } from "@/components/security/ReCaptcha";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { isVendorRole } from "@/lib/auth/userRole";
import { requestClaimLink } from "@/features/vendorClaim/actions/requestClaimLink";
import { CLAIM_PARAM } from "@/lib/constants";

interface ManageProfilePromptProps {
  slug: string;
  /** The listing's vendor id, compared against the viewer's own to spot the owner. */
  vendorId: string;
  businessName: string;
  /** Whether the listing has already been claimed (has a vendor account). */
  isClaimed: boolean;
  /** Whether there's an email on file to send a claim link to. */
  hasEmail: boolean;
  /** Pre-masked hint of the email on file. */
  emailHint: string;
}

/** "4:59" — a ticking countdown reads better than a rounded "5 minutes". */
function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ManageProfilePrompt({
  slug,
  vendorId,
  businessName,
  isClaimed,
  hasEmail,
  emailHint,
}: ManageProfilePromptProps) {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { addNotification } = useNotification();
  const recaptchaRef = useRef<ReCaptchaRef>(null);

  const { role, vendorId: viewerVendorId, isLoading: isAuthLoading, isRoleLoading } = useAuth();
  const isOwner = !!viewerVendorId && viewerVendorId === vendorId;

  // Deep link from the expired-claim-link error page: ?claim=1 opens the dialog
  // straight away, so requesting a fresh link is one click from the dead one.
  // Only honoured when there's actually a link to send, mirroring handleClick.
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(
    () => searchParams?.get(CLAIM_PARAM) === "1" && !isClaimed && hasEmail
  );
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  // Remaining seconds on the per-listing cooldown, shown inline and ticked down
  // locally. A toast disappears long before the wait does.
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((remaining) => Math.max(0, remaining - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const handleClick = () => {
    // The owner already has an account and a dashboard — skip the claim flow.
    if (isOwner) {
      router.push("/partner/dashboard/profile");
      return;
    }
    // Already-claimed listings have a vendor account — send them straight to
    // login rather than through the claim-link flow. No dialog.
    if (isClaimed) {
      router.push("/partner/login");
      return;
    }
    // No email on file means there's nowhere to send a claim link — hand off
    // to the contact form (pre-selected to the claim reason) instead.
    if (!hasEmail) {
      router.push("/partner/contact?reason=claim");
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    if (isSending) return;
    setOpen(false);
    // Reset back to the initial state for a future open.
    setIsSent(false);
    setCooldownRemaining(0);
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      // Falls back to the dev/preview bypass token when no site key is
      // configured locally (see verifyRecaptchaToken).
      const recaptchaToken = (await recaptchaRef.current?.executeAsync()) ?? "test-bypass";
      recaptchaRef.current?.reset();

      const result = await requestClaimLink({ slug, recaptchaToken });

      if (result.success) {
        setIsSent(true);
      } else if (result.retryAfterSeconds) {
        // Rate limited — keep the wait on screen and disable the button until
        // it runs out, rather than flashing it in a toast.
        setCooldownRemaining(result.retryAfterSeconds);
      } else {
        addNotification(result.error, "error");
      }
    } catch (error) {
      console.error("Failed to request claim link:", error);
      addNotification("Something went wrong. Please try again.", "error");
    } finally {
      setIsSending(false);
    }
  };

  // Vendors only ever see this on their own listing; everyone else (logged out,
  // brides, admins) gets the claim prompt. Waiting on the role avoids flashing
  // the wrong label at an owner mid-load.
  if (isAuthLoading || isRoleLoading) return null;
  if (isVendorRole(role) && !isOwner) return null;

  return (
    <>
      <Box sx={{ textAlign: "center", mt: 2, mb: 1 }}>
        <Link
          component="button"
          type="button"
          onClick={handleClick}
          underline="hover"
          sx={{ color: "text.secondary", fontSize: "0.875rem" }}
        >
          {isOwner ? "Edit your profile." : "Is this your business? Manage this profile."}
        </Link>
      </Box>

      {/* The owner never goes through the claim-link flow, so no dialog for
          them — including via the ?claim=1 deep link, which resolves before
          the auth role does. */}
      {!isOwner && (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth fullScreen={isMobile}>
          {isSent ? (
            <DialogContent sx={{ textAlign: "center", py: 5 }}>
              <MarkEmailReadOutlinedIcon color="success" sx={{ fontSize: 48, mb: 1.5 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Check your inbox
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                If {businessName} is in our directory, we&apos;ve sent a secure link to the email
                listed for this profile ({emailHint}). Follow it to manage this profile.
              </Typography>
              <Button onClick={handleClose} variant="contained" color="primary">
                Done
              </Button>
            </DialogContent>
          ) : (
            <>
              <DialogTitle>Manage this profile</DialogTitle>
              <DialogContent>
                {cooldownRemaining > 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Check your inbox and spam folder for the link. Still don&apos;t see it? Request a
                    new link in {formatCountdown(cooldownRemaining)}.
                  </Alert>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  To keep your listing secure, we&apos;ll send a one-time link to the email listed for{" "}
                  {businessName}:
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1.5,
                    mb: 3,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                  }}
                >
                  <CheckCircleOutlineIcon fontSize="small" color="disabled" />
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                    {emailHint}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                  <Button onClick={handleClose} disabled={isSending}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSend}
                    variant="contained"
                    color="primary"
                    disabled={isSending || cooldownRemaining > 0}
                  >
                    {isSending
                      ? "Sending…"
                      : cooldownRemaining > 0
                        ? `Send me a link (${formatCountdown(cooldownRemaining)})`
                        : "Send me a link"}
                  </Button>
                </Box>
              </DialogContent>
            </>
          )}
          <ReCaptcha ref={recaptchaRef} />
        </Dialog>
      )}
    </>
  );
}
