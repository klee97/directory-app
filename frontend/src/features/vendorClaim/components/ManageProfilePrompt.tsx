"use client";

import { useRef, useState } from "react";
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
import { requestClaimLink } from "@/features/vendorClaim/actions/requestClaimLink";

interface ManageProfilePromptProps {
  slug: string;
  businessName: string;
  /** Pre-masked hint of the email on file, e.g. "j•••@g•••.com". */
  emailHint: string;
}

export default function ManageProfilePrompt({
  slug,
  businessName,
  emailHint,
}: ManageProfilePromptProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { addNotification } = useNotification();
  const recaptchaRef = useRef<ReCaptchaRef>(null);

  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleClose = () => {
    if (isSending) return;
    setOpen(false);
    // Reset back to the initial state for a future open.
    setIsSent(false);
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

  return (
    <>
      <Box sx={{ textAlign: "center", mt: 6, mb: 2 }}>
        <Link
          component="button"
          type="button"
          onClick={() => setOpen(true)}
          underline="hover"
          sx={{ color: "text.secondary", fontSize: "0.875rem" }}
        >
          Are you {businessName}? Manage this profile
        </Link>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth fullScreen={isMobile}>
        {isSent ? (
          <DialogContent sx={{ textAlign: "center", py: 5 }}>
            <MarkEmailReadOutlinedIcon color="success" sx={{ fontSize: 48, mb: 1.5 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Check your inbox
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              If {businessName} is in our directory, we&apos;ve sent a secure link to the email on
              file ({emailHint}). Follow it to manage this profile.
            </Typography>
            <Button onClick={handleClose} variant="contained" color="primary">
              Done
            </Button>
          </DialogContent>
        ) : (
          <>
            <DialogTitle>Manage this profile</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                To keep your listing secure, we&apos;ll email a link to the address we have on file
                for {businessName}:
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
                  disabled={isSending}
                >
                  {isSending ? "Sending…" : "Send me a link"}
                </Button>
              </Box>
            </DialogContent>
          </>
        )}
        <ReCaptcha ref={recaptchaRef} />
      </Dialog>
    </>
  );
}
