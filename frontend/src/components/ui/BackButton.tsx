"use client";

import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";

interface BackButtonProps {
  fallbackHref?: string;
}

export default function BackButton({
  fallbackHref = "/",
}: BackButtonProps) {
  const router = useRouter();

  const canGoBack = (() => {
    if (typeof window === "undefined") return false;
    if (!document.referrer) return false;

    try {
      const referrerUrl = new URL(document.referrer);
      return referrerUrl.origin === window.location.origin;
    } catch {
      return false;
    }
  })();

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <Button variant="text" onClick={handleBack} color="secondary">
      ← Back
    </Button>
  );
}