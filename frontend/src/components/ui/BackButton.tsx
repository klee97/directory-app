"use client";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";

export default function BackButton() {
  const router = useRouter();
  const referrer = typeof document !== 'undefined' ? document.referrer : ''; // Get the referrer (previous page)
  const backUrl = referrer ? referrer : '/'; // '/' should be the directory path

  const handleBack = () => {
    // If there's a referrer, use the browser's back action
    if (referrer) {
      router.back();
    } else {
      // If no referrer, navigate to the directory directly
      router.push(backUrl);
    }
  };
  return (
    <Button variant="text" onClick={handleBack} color='secondary'>
      ← Back to Directory
    </Button>
  );
}