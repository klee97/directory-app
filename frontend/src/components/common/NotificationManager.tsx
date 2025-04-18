"use client";

import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useNotification } from '@/contexts/NotificationContext';

export const NotificationManager: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const handleClose = (key: number) => {
    removeNotification(key);
  };

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