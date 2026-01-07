import { useState } from 'react';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import { isDevelopment } from '@/lib/env/env';
import { revalidateVendors } from '@/lib/actions/revalidate';

export default function DevTools() {
  const [cacheStatus, setCacheStatus] = useState('ready');

  // Don't render in production
  if (!isDevelopment()) {
    return null;
  }

  const handleCacheRefresh = async () => {
    setCacheStatus('refreshing');
    try {
      await revalidateVendors();
      setCacheStatus('refreshed');
      setTimeout(() => setCacheStatus('ready'), 2000);
    } catch (error) {
      console.error('Cache refresh failed:', error);
      setCacheStatus('error');
      setTimeout(() => setCacheStatus('ready'), 2000);
    }
  };

  const getButtonProps = () => {
    switch (cacheStatus) {
      case 'refreshing':
        return {
          children: 'Refreshing...',
          startIcon: <CircularProgress size={16} />,
          disabled: true
        };
      case 'refreshed':
        return {
          children: 'Refreshed!',
          startIcon: <CheckIcon />,
          disabled: false
        };
      case 'error':
        return {
          children: 'Error',
          startIcon: <ErrorIcon />,
          disabled: false
        };
      default:
        return {
          children: 'Refresh Vendors',
          startIcon: <RefreshIcon />,
          disabled: false
        };
    }
  };

  return (
    <FormControl>
      <FormLabel>Dev Tools</FormLabel>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleCacheRefresh}
          color='info'
          {...getButtonProps()}
        />
      </Box>
    </FormControl>
  );
}