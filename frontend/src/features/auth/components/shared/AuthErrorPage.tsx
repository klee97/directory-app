'use client'

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import HomeIcon from '@mui/icons-material/Home'
import EmailIcon from '@mui/icons-material/Email'
import RefreshIcon from '@mui/icons-material/Refresh'

type ErrorType = 'verification' | 'passwordReset';

interface AuthErrorPageProps {
  errorType: ErrorType;
  routes: {
    login: string;
    verifyOrForgot: string;
    home: string;
    support: string;
  };
  labels: {
    homeButton: string;
  };
}

const errorContent = {
  verification: {
    title: 'Account Verification Failed',
    description: "We couldn't verify your account. This could be because:",
    reasons: [
      'The verification link has expired',
      'The link was already used',
      'The authentication token is invalid'
    ],
    primaryButtonText: 'Log in',
    secondaryButtonText: 'Get a new link',
    secondaryButtonIcon: <EmailIcon />
  },
  passwordReset: {
    title: 'Password Reset Link Failed',
    description: "We couldn't verify your account for password reset. This could be because:",
    reasons: [
      'The reset link has expired',
      'The reset link was already used'
    ],
    primaryButtonText: 'Get a new link',
    secondaryButtonText: null,
    secondaryButtonIcon: null
  }
};

export function AuthErrorPage({ errorType, routes, labels }: AuthErrorPageProps) {
  const content = errorContent[errorType];

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              {content.title}
            </Typography>
          </Box>

          <Typography variant="body1" component={"p"} gutterBottom>
            {content.description}
          </Typography>

          <Box sx={{ ml: 2, mb: 3 }}>
            {content.reasons.map((reason, index) => (
              <Typography key={index} variant="body1" component={"p"}>
                • {reason}
              </Typography>
            ))}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="h6" gutterBottom>
            What you can do:
          </Typography>

          <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
            <Link href={errorType === 'verification' ? routes.login : routes.verifyOrForgot} style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
              >
                {content.primaryButtonText}
              </Button>
            </Link>
            {errorType === 'verification' && content.secondaryButtonText && (
              <Link href={routes.verifyOrForgot} style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={content.secondaryButtonIcon}
                >
                  {content.secondaryButtonText}
                </Button>
              </Link>
            )}
            <Link href={routes.home} style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<HomeIcon />}
              >
                {labels.homeButton}
              </Button>
            </Link>
          </Stack>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              If you continue to experience issues, please contact <Link href={routes.support}>support</Link>.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
