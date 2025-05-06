"use client";

import { createContext, useContext, useState, useCallback } from 'react';
import { AlertColor } from '@mui/material/Alert';

interface Notification {
  message: string;
  severity: AlertColor;
  key: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, severity?: AlertColor) => void;
  removeNotification: (key: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counter, setCounter] = useState(0);

  const addNotification = useCallback((message: string, severity: AlertColor = 'success') => {
    const key = counter;
    setCounter(prev => prev + 1);
    setNotifications(prev => [...prev, { message, severity, key }]);
  }, [counter]);

  const removeNotification = useCallback((key: number) => {
    setNotifications(prev => prev.filter(notification => notification.key !== key));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 