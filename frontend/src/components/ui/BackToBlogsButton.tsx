"use client";

import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";

export default function BackToBlogsButton() {
  const router = useRouter();

  const handleBack = () => {
    router.push(`/blog${window.location.search}`);
  };

  return (
    <Button variant="text" onClick={handleBack} color="secondary">
      ← Back to all posts
    </Button>
  );
}