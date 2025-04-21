'use client'

import { Container, Typography, Box, Button, Paper, Stack, Divider, Link } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import HomeIcon from '@mui/icons-material/Home'
import EmailIcon from '@mui/icons-material/Email'
import RefreshIcon from '@mui/icons-material/Refresh'

export default function AuthCodeErrorPage() {

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

          <Typography variant="body1" component={"p"} gutterBottom>
            We couldn&apos;t verify your account. This could be because:
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

          <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
              >
                Try logging in
              </Button>
            </Link>
            <Link href="/auth/verify-email" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EmailIcon />}
              >
                Get a new verification link
              </Button>
            </Link>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<HomeIcon />}
              >
                Return to homepage
              </Button>
            </Link>
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