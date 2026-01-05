import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { ForgotPasswordForm } from "@/features/login/components/ForgotPasswordForm";

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