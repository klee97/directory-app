"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import NextLink from "next/link";
import { login } from "@/features/login/api/actions";
import { useNotification } from "@/contexts/NotificationContext";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import ArrowForward from "@mui/icons-material/ArrowForward";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";

export const LoginForm = ({ isVendorLogin, redirectTo }: { isVendorLogin: boolean, redirectTo: string | undefined }) => {
  const { addNotification } = useNotification();
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isVendorLoginEnabled = process.env.NEXT_PUBLIC_FEATURE_VENDOR_LOGIN_ENABLED === 'true';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsSubmitting(true);

    try {
      const result = await login(formData);
      if (result && result.action === 'verify-email') {
        setVerificationNeeded(true);
        return;
      }

      if (result && result.error) {
        addNotification(result.error, 'error');
        return;
      }

      const isVendorAccount = result?.isVendorAccount ?? isVendorLogin;
      let redirectPath: string;
      let notificationMessage = 'Logged in successfully!';

      if (isVendorAccount && !isVendorLogin) {
        redirectPath = redirectTo || '/partner/dashboard';
        notificationMessage = 'Logged in successfully! Redirecting to Vendor Dashboard...';
      } else if (!isVendorAccount && isVendorLogin) {
        redirectPath = redirectTo || '/';
        notificationMessage = 'Logged in successfully! Redirecting to Directory...';
      } else {
        redirectPath = redirectTo || (isVendorLogin ? '/partner/dashboard' : '/');
      }

      // Refresh client-side auth state so the navbar and other client UI update
      refreshSession().catch((e) => {
        console.debug('refreshSession failed after login:', e);
      });

      addNotification(notificationMessage);
      router.push(redirectPath);

    } catch (error) {
      console.error("An unexpected error occurred: " + error);
      addNotification('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>

          {verificationNeeded && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Your email is not verified. Please check your inbox and follow the verification link.
              <Box mt={1}>
                <Button
                  size="small"
                  component={NextLink}
                  href="/auth/verify-email"
                >
                  Get a new verification link
                </Button>
              </Box>
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              variant="outlined"
              disabled={isSubmitting}
              color={isVendorLogin ? "secondary" : "primary"}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              variant="outlined"
              disabled={isSubmitting}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
              color={isVendorLogin ? "secondary" : "primary"}
            />
            {!isVendorLogin && (
              <Typography variant="body1" align="left" sx={{ mt: 2, ml: 1 }}>
                <Link component={NextLink} href="/forgot-password" color={"inherit"}>
                  Forgot password?
                </Link>
              </Typography>
            )}
            {isVendorLogin && (<Typography variant="body1" align="left" sx={{ mt: 2, ml: 1 }}>
              <Link component={NextLink} href="/partner/forgot-password" color={"inherit"}>
                Forgot password?
              </Link>
            </Typography>
            )}

            <Stack spacing={2} direction="column" sx={{ mt: 3 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
                color={isVendorLogin ? "secondary" : "primary"}
                data-testid="login-submit"
              >
                {isSubmitting ? 'Logging in...' : 'Log In'}
              </Button>

              {!isVendorLogin && (
                <Typography variant="body1" align="center" sx={{ mt: 2 }}>
                  Don&apos;t have an account?{' '}
                  <Link component={NextLink} href="/signup" color={"inherit"}>
                    Sign up
                  </Link>
                </Typography>
              )}
              {isVendorLogin && (
                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                  Don&apos;t have an account?{' '}
                  <Link component={NextLink} href="/partner/contact" color={"inherit"}>
                    Contact us</Link> to access your vendor profile.

                </Typography>
              )}
            </Stack>
          </Box>
        </Paper>

        {!isVendorLogin && isVendorLoginEnabled && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Are you a hair or makeup artist?
              </Typography>
            </Divider>
            <Button
              component={NextLink}
              href="/partner/login"
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: 2,
                py: 1.5,
                fontWeight: 500,
                letterSpacing: 0.5,
                boxShadow: '0 4px 14px rgba(133, 160, 122, 0.45)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(133, 160, 122, 0.6)',
                },
              }}
            >
              Vendor Login
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}