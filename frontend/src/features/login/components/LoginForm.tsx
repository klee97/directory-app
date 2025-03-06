import React from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import { login, signup } from '../api/actions';

export function LoginForm() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Account Access
          </Typography>

          <Box component="form" sx={{ mt: 2 }}>
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
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              variant="outlined"
            />

            <Stack spacing={2} direction="column" sx={{ mt: 3 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                formAction={login}
              >
                Log In
              </Button>

              <Divider sx={{ my: 1 }}>or</Divider>

              <Button
                type="submit"
                fullWidth
                variant="outlined"
                size="large"
                formAction={signup}
              >
                Sign Up
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}