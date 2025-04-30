import { Container, Typography } from "@mui/material";
import { ForgotPasswordForm } from "@/features/login/components/ResetPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <Container maxWidth="sm">
      <br />
      <Typography variant="h1" gutterBottom sx={{ mt: 2 }}>
        Reset Password
      </Typography>
      <ForgotPasswordForm />
    </Container>
  );
} 