'use client'

import { Container, Typography, Box, Button, Paper, Stack, Divider } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import HomeIcon from '@mui/icons-material/Home'
import EmailIcon from '@mui/icons-material/Email'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useRouter } from 'next/navigation'

export default function AuthCodeErrorPage() {
  const router = useRouter()

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Account Verification Failed
            </Typography>
          </Box>

          <Typography variant="body1" component={"p"}>
            We couldn't verify your account. This could be because:
          </Typography>

          <Box sx={{ ml: 2, mb: 3 }}>
            <Typography variant="body1" component={"p"}>
              • The verification link has expired
            </Typography>
            <Typography variant="body1" component={"p"}>
              • The link was already used
            </Typography>
            <Typography variant="body1" component={"p"}>
              • The authentication token is invalid
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="h6" gutterBottom>
            What you can do:
          </Typography>

          <Stack spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<RefreshIcon />}
              onClick={() => router.push('/auth/resend-verification')}
            >
              Request a new verification link
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<EmailIcon />}
              onClick={() => router.push('/auth/signin')}
            >
              Try signing in
            </Button>
            <Button
              variant="text"
              startIcon={<HomeIcon />}
              fullWidth
              onClick={() => router.push('/')}
            >
              Return to homepage
            </Button>
          </Stack>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              If you continue to experience issues, please contact support.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}