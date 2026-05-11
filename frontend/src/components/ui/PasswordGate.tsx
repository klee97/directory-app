'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

interface PasswordGateProps {
  redirectTo?: string
}

export default function PasswordGate({ redirectTo = '/blog' }: PasswordGateProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!password) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/preview-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      window.location.href = redirectTo  // hard nav so middleware re-runs
    } else {
      setError('Incorrect password. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        backgroundColor: 'grey.300',
        pt: 25,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%', maxWidth: 'sm', px: 3 }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: '1.5px solid',
            borderColor: 'text.secondary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LockOutlinedIcon sx={{ color: 'text.secondary' }} fontSize="large" />
        </Box>

        <Box
          sx={{
            width: '100%',
            backgroundColor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
          }}
        >
          <InputBase
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            fullWidth
          />
          <IconButton onClick={handleSubmit} disabled={loading || !password} edge="end" size="small">
            <ArrowForwardIcon sx={{ color: password ? 'text.primary' : 'text.secondary' }} />
          </IconButton>
        </Box>

        {error && (
          <Typography variant="body2" color="error">{error}</Typography>
        )}
      </Box>
    </Box>
  )
}