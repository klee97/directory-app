"use client";

import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useNotification } from '@/contexts/NotificationContext';

export const NotificationManager: React.FC = () => {
  const { notifications, removeNotification, addNotification } = useNotification();

  const handleClose = (key: number) => {
    removeNotification(key);
  };

  React.useEffect(() => {
    // Only runs on client-side after mount
    const params = new URLSearchParams(window.location.search)
    const message = params.get('message')

    if (message) {
      addNotification(message)

      // Optionally: Clean up URL by removing the parameter (to prevent showing
      // the notification again on page refresh)
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [addNotification])

  return (
    <>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.key}
          open={true}
          autoHideDuration={6000}
          onClose={() => handleClose(notification.key)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ mt: 2 }}
        >
          <Alert
            onClose={() => handleClose(notification.key)}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}; 