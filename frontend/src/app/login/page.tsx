import { LoginForm } from "@/features/login/components/LoginForm";
import { Container, Typography } from "@mui/material";

export default function ContactUs() {
  return (
    <Container maxWidth="sm">
      <br />
      <Typography variant="h1" gutterBottom sx={{ mt: 2 }}>
        Login
      </Typography>
      <LoginForm />
    </Container>
  );
}
