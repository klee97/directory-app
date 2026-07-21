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

    // A referrer is only set on a hard navigation into this page. When present,
    // only go back if it's same-origin so we never leave the site.
    if (document.referrer) {
      try {
        return new URL(document.referrer).origin === window.location.origin;
      } catch {
        return false;
      }
    }

    // Next.js soft (client-side) navigations don't update document.referrer, so
    // an empty referrer doesn't mean there's nowhere to go back to. If the
    // history stack has more than this entry, the user navigated here within the
    // app (e.g. from the directory or the landing page) — return them there.
    return window.history.length > 1;
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