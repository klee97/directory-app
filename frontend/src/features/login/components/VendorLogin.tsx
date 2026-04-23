"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/features/login/components/LoginForm";

export default function VendorLogin() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo")
    ? decodeURIComponent(searchParams.get("redirectTo")!)
    : undefined;

  return (
    <Container maxWidth="sm">
      <br />
      <Typography variant="h1" gutterBottom sx={{ mt: 2 }}>
        Vendor Login
      </Typography>

      <LoginForm isVendorLogin={true} redirectTo={redirectTo} />
    </Container>
  );
}
