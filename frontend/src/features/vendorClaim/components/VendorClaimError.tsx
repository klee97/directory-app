"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import AlertTitle from "@mui/material/AlertTitle";

export type ErrorType =
  | "invalid_link"
  | "missing_params"
  | "recaptcha_failed"
  | null;

const ERROR_CONTENT: Record<
  NonNullable<ErrorType>,
  { title: string; message: string; primaryLabel: string; primaryHref: string }
> = {
  invalid_link: {
    title: "Invalid claim link",
    message: "This link is invalid or has already been used. Each link can only be used once.",
    primaryLabel: "Log in",
    primaryHref: "/partner/login",
  },
  missing_params: {
    title: "Incomplete claim link",
    message:
      "The link appears to be incomplete. Please check you've copied the full URL from your email.",
    primaryLabel: "Log in",
    primaryHref: "/partner/login",
  },
  recaptcha_failed: {
    title: "Security verification failed",
    message:
      "We couldn't verify your request. This may be due to a network issue or browser settings.",
    primaryLabel: "Try again",
    primaryHref: "", // handled separately via reload
  },
};

interface VendorClaimErrorProps {
  errorType: NonNullable<ErrorType>;
}

export default function VendorClaimError({ errorType }: VendorClaimErrorProps) {
  const router = useRouter();
  const { title, message, primaryLabel, primaryHref } = ERROR_CONTENT[errorType];

  const handlePrimary = () => {
    if (errorType === "recaptcha_failed") {
      window.location.reload();
    } else {
      router.push(primaryHref);
    }
  };

  return (
    <>
      <Alert severity="error" sx={{ mb: 3 }}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Button variant="contained" onClick={handlePrimary} fullWidth>
          {primaryLabel}
        </Button>
        <Button variant="outlined" onClick={() => router.push("/partner")} fullWidth>
          Return home
        </Button>
      </Box>
    </>
  );
}