"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Button from "@mui/material/Button";

interface BackButtonProps {
  fallbackHref?: string;
}

export default function BackButton({
  fallbackHref = "/",
}: BackButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
      const paramsString = searchParams ? searchParams.toString() : "";
      const fallback = `${fallbackHref}${paramsString ? `?${paramsString}` : ""}`;
      router.push(fallback);
    }
  };

  return (
    <Button variant="text" onClick={handleBack} color="secondary">
      ← Back
    </Button>
  );
}