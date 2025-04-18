import React from 'react';
import { Box, Button, Typography } from '@mui/material';

export default function KoFiButton({
  color = "primary.main",
  label = "Buy us a coffee",
  borderRadius = "12px"
}) {
  return (
    <Box sx={{ display: 'flex' }}>
      <Button
        component="a"
        href={`https://ko-fi.com/asianweddingmakeup`}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          backgroundColor: color,
          borderRadius: borderRadius,
          color: '#fff',
          textTransform: 'none',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          '&:hover': {
            backgroundColor: color,
            opacity: 0.9,
          }
        }}
      >
        <Box
          component="img"
          src="https://ko-fi.com/img/cup-border.png"
          alt="Ko-Fi cup"
          sx={{ 
            height: '20px',
            width: 'auto'
          }}
        />
        <Typography variant="button">
          {label}
        </Typography>
      </Button>
    </Box>
  );
}