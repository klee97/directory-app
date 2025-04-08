import { Container, Typography, Paper, Box, Button } from "@mui/material";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Verify Your Email
          </Typography>
          
          <Typography variant="body1" align="center" paragraph>
            We've sent a verification email to your inbox. Please check your email and click the verification link to complete your signup.
          </Typography>
          
          <Typography variant="body1" align="center" paragraph>
            If you don't see the email, please check your spam folder.
          </Typography>
          
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