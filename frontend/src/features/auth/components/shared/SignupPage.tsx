"use client";

import { SignupForm } from "@/features/login/components/SignupForm";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface SignupPageProps {
  title: string;
  redirectUrl: string;
}

export function SignupPage({ title, redirectUrl }: SignupPageProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      router.push(redirectUrl);
    }
  }, [isLoggedIn, router, redirectUrl]);

  return (
    <Container maxWidth="sm">
      <br />
      <Typography variant="h1" gutterBottom sx={{ mt: 2 }}>
        {title}
      </Typography>
      <SignupForm />
    </Container>
  );
}
