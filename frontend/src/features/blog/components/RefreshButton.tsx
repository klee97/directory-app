'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import CircularProgress from '@mui/material/CircularProgress';
import { refreshPosts } from '../api/actions';

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPosts();
    } catch (error) {
      console.error('Failed to refresh posts:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="outlined"
      startIcon={isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
      onClick={handleRefresh}
      disabled={isRefreshing}
    >
      {isRefreshing ? 'Refreshing...' : 'Refresh Posts'}
    </Button>
  );
}