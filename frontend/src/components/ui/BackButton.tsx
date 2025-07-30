"use client";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button variant="text" onClick={() => router.back()} color="secondary">
      ← Back
    </Button>
  );
}