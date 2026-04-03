import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { ForgotPasswordForm } from "@/features/login/components/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Forgot Password | Asian Wedding Makeup',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ForgotPasswordPage() {
  return (
    <Container maxWidth="sm">
      <br />
      <Typography variant="h1" gutterBottom sx={{ mt: 2 }}>
        Forgot Password
      </Typography>
      <ForgotPasswordForm />
    </Container>
  );
} 