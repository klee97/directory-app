import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Stack,
  Container
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Warning,
  Language,
  Storage
} from '@mui/icons-material';
import { getEnvironment } from '@/lib/env/env';

interface ServerEnvInfo {
  detected: string;
  VERCEL_ENV: string;
  NODE_ENV: string;
  VERCEL_URL: string;
  NEXT_PUBLIC_VERCEL_ENV: string;
}

const EnvDebugPanel = () => {
  const [serverEnv, setServerEnv] = useState<ServerEnvInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/env-debug')
      .then(res => res.json())
      .then(data => {
        setServerEnv(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch server env:', err);
        setLoading(false);
      });
  }, []);

  const clientEnv = {
    detected: getEnvironment(),
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV || 'undefined',
    NODE_ENV: process.env.NODE_ENV || 'undefined',
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
    href: typeof window !== 'undefined' ? window.location.href : 'N/A',
  };

  const getStatusIcon = (isCorrect: boolean | null) => {
    if (isCorrect === null) return <Warning color="warning" />;
    return isCorrect ? <CheckCircle color="success" /> : <Cancel color="error" />;
  };

  const getEnvColor = (env: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (env) {
      case 'production': return 'error';
      case 'preview': return 'warning';
      case 'development': return 'info';
      default: return 'default';
    }
  };

  const expectedEnv =
    clientEnv.hostname === 'localhost' || clientEnv.hostname === '127.0.0.1'
      ? 'development'
      : clientEnv.hostname.includes('vercel.app') && !clientEnv.hostname.includes('-git-')
        ? 'Could be production or preview'
        : 'Unknown - check manually';

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Paper elevation={8} sx={{ overflow: 'hidden' }}>
          {/* Header */}
          <Box sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
            p: 4,
            color: 'white'
          }}>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
              Environment Debug Panel
            </Typography>
            <Typography variant="subtitle1">
              Verify environment detection across all deployment types
            </Typography>
          </Box>

          <Box sx={{ p: 4 }}>
            <Stack spacing={3}>
              {/* Expected Environment */}
              <Alert severity="warning" icon={<Warning />}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Expected Environment
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {expectedEnv}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Based on hostname: <code style={{
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {clientEnv.hostname}
                  </code>
                </Typography>
              </Alert>

              {/* Client Side */}
              <Card variant="outlined" sx={{ borderColor: '#2196f3', borderWidth: 2 }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <Language color="primary" />
                    <Typography variant="h5" component="h2" fontWeight="bold">
                      Client Side (Browser)
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    <EnvRow
                      label="Detected Environment"
                      value={clientEnv.detected}
                      highlight={true}
                      icon={getStatusIcon(null)}
                      envColor={getEnvColor(clientEnv.detected)}
                    />
                    <EnvRow
                      label="NEXT_PUBLIC_VERCEL_ENV"
                      value={clientEnv.NEXT_PUBLIC_VERCEL_ENV}
                    />
                    <EnvRow
                      label="NODE_ENV"
                      value={clientEnv.NODE_ENV}
                    />
                    <EnvRow
                      label="Hostname"
                      value={clientEnv.hostname}
                    />
                    <EnvRow
                      label="Full URL"
                      value={clientEnv.href}
                      small={true}
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Server Side */}
              <Card variant="outlined" sx={{ borderColor: '#4caf50', borderWidth: 2 }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <Storage color="success" />
                    <Typography variant="h5" component="h2" fontWeight="bold">
                      Server Side (API)
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : serverEnv ? (
                    <Stack spacing={2}>
                      <EnvRow
                        label="Detected Environment"
                        value={serverEnv.detected}
                        highlight={true}
                        icon={getStatusIcon(clientEnv.detected === serverEnv.detected)}
                        envColor={getEnvColor(serverEnv.detected)}
                      />
                      <EnvRow
                        label="VERCEL_ENV"
                        value={serverEnv.VERCEL_ENV}
                      />
                      <EnvRow
                        label="NODE_ENV"
                        value={serverEnv.NODE_ENV}
                      />
                      <EnvRow
                        label="VERCEL_URL"
                        value={serverEnv.VERCEL_URL}
                        small={true}
                      />
                    </Stack>
                  ) : (
                    <Alert severity="error">
                      <Typography variant="body2" gutterBottom>
                        Failed to load server environment. Create the API route:
                      </Typography>
                      <code style={{
                        display: 'block',
                        marginTop: '8px',
                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                        padding: '8px',
                        borderRadius: '4px'
                      }}>
                        /api/env-debug/route.ts
                      </code>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Match Status */}
              {!loading && serverEnv && (
                <Alert
                  severity={clientEnv.detected === serverEnv.detected ? "success" : "error"}
                  icon={clientEnv.detected === serverEnv.detected ?
                    <CheckCircle /> : <Cancel />}
                >
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    {clientEnv.detected === serverEnv.detected
                      ? '✓ Client and Server Match'
                      : '✗ Mismatch Detected!'
                    }
                  </Typography>
                  <Typography variant="body2">
                    {clientEnv.detected === serverEnv.detected
                      ? 'Both client and server correctly detected the same environment.'
                      : `Client detected "${clientEnv.detected}" but server detected "${serverEnv.detected}". Check your environment variable configuration.`
                    }
                  </Typography>
                </Alert>
              )}

              {/* Instructions */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Testing Checklist
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <ChecklistItem
                      env="LOCAL"
                      description="Should show 'development' on localhost:3000"
                    />
                    <ChecklistItem
                      env="PREVIEW"
                      description="Should show 'preview' on Vercel preview deployments (PR/branch deploys)"
                    />
                    <ChecklistItem
                      env="PROD"
                      description="Should show 'production' on your main domain/production deployment"
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

interface EnvRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  small?: boolean;
  icon?: React.ReactNode;
  envColor?: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
}

const EnvRow = ({ label, value, highlight = false, small = false, icon = null, envColor = 'default' }: EnvRowProps) => (
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 1.5,
    borderRadius: 1,
    backgroundColor: highlight ? 'action.selected' : 'grey.50'
  }}>
    <Stack direction="row" spacing={1} alignItems="center">
      {icon && <Box sx={{ display: 'flex', alignItems: 'center' }}>{icon}</Box>}
      <Typography
        variant="body2"
        fontWeight={highlight ? 'bold' : 'regular'}
        color="text.secondary"
      >
        {label}:
      </Typography>
    </Stack>
    {highlight ? (
      <Chip
        label={value}
        color={envColor}
        size="small"
        sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}
      />
    ) : (
      <code style={{
        backgroundColor: 'white',
        padding: '4px 12px',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        fontSize: small ? '0.75rem' : '0.875rem',
        color: value === 'undefined' ? '#d32f2f' : '#212121'
      }}>
        {value}
      </code>
    )}
  </Box>
);

interface ChecklistItemProps {
  env: string;
  description: string;
}

const ChecklistItem = ({ env, description }: ChecklistItemProps) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
    <Chip
      label={env}
      size="small"
      sx={{
        fontFamily: 'monospace',
        fontWeight: 'bold',
        mr: 2,
        minWidth: 80
      }}
    />
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
      {description}
    </Typography>
  </Box>
);

export default EnvDebugPanel;