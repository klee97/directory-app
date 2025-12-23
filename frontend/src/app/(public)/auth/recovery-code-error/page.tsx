'use client'

import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import HomeIcon from '@mui/icons-material/Home'
import RefreshIcon from '@mui/icons-material/Refresh'

export default function AuthCodeErrorPage() {

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Password Reset Link Failed
            </Typography>
          </Box>

          <Typography variant="body1" component={"p"} gutterBottom>
            We couldn&apos;t verify your account for password reset. This could be because:
          </Typography>

          <Box sx={{ ml: 2, mb: 3 }}>
            <Typography variant="body1" component={"p"}>
              • The reset link has expired
            </Typography>
            <Typography variant="body1" component={"p"}>
              • The reset link was already used
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="h6" gutterBottom>
            What you can do:
          </Typography>

          <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
            <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
              >
                Request another password reset link
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
              If you continue to experience issues, please contact <Link href="/contact">support</Link>.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}