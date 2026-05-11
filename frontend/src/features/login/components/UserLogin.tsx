"use client";

import { LoginForm } from "@/features/login/components/LoginForm";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useSearchParams } from "next/navigation";

export default function UserLogin() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo")
    ? decodeURIComponent(searchParams.get("redirectTo")!)
    : undefined;

  return (
    <Container maxWidth="sm">
      <br />
      <Typography variant="h1" gutterBottom sx={{ mt: 2 }}>
        Login
      </Typography>
      <LoginForm isVendorLogin={false} redirectTo={redirectTo} />
    </Container>
  );
}
