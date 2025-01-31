"use client";
import { useSearchParams } from "next/navigation";
import { Button } from "@mui/material";

export default function BackButton() {
  const searchParams = useSearchParams();
  const queryParams = searchParams.toString();
  const backUrl = queryParams ? `/?${queryParams}` : "/";
  console.log("queryParams: %s", queryParams);

  return (
    <Button variant="text" href={backUrl}>
      ← Back to Directory
    </Button>
  );
}