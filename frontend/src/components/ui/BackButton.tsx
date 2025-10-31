"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";

export default function BackButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    } else {
      // If no history, reconstruct a useful fallback
      const paramsString = searchParams ? searchParams.toString() : "";
      const fallback = `/${paramsString ? `?${paramsString}` : ""}`;
      router.push(fallback);
    }
  };

  return (
    <Button variant="text" onClick={handleBack} color="secondary">
      {canGoBack ? "← Back" : "← Back to Directory"}
    </Button>
  );
}