import { Container, Typography, Paper, Box, Button, Alert } from "@mui/material";
import Link from "next/link";
import { ResendVerificationForm } from "@/features/login/components/ResendVerificationForm";

export default function VerifyEmailPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Verify Your Email
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body1">
              We&apos;ve sent a verification email to your inbox. Please check your email and click the verification link to complete your signup.
            </Typography>
          </Alert>
          
          <Typography variant="body1" paragraph>
            If you don&apos;t see the email:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2, mb: 3 }}>
            <Typography component="li" variant="body1">
              Check your spam folder
            </Typography>
            <Typography component="li" variant="body1">
              Wait a few minutes for the email to arrive
            </Typography>
            <Typography component="li" variant="body1">
              Make sure you entered the correct email address
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom>
            Need a new verification link?
          </Typography>
          
          <ResendVerificationForm />
          
          <Box display="flex" justifyContent="center" mt={4}>
            <Link href="/login" passHref style={{ textDecoration: 'none' }}>
              <Button variant="contained" color="primary">
                Return to Login
              </Button>
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 