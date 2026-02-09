'use client';

import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { createClient } from '@/lib/supabase/client';
import { useNotification } from '@/contexts/NotificationContext';

interface NavigationOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  action?: 'signout';
  showForVendor?: boolean;
  showForPublic?: boolean;
}

const navigationOptions: NavigationOption[] = [
  {
    id: 'favorites',
    label: 'My Favorites',
    icon: <FavoriteIcon fontSize="small" />,
    path: '/favorites',
    showForPublic: true,
    showForVendor: false,
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon fontSize="small" />,
    path: '/partner/dashboard',
    showForVendor: true,
    showForPublic: false,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon fontSize="small" />,
    path: '/settings',
    showForVendor: true,
    showForPublic: true,
  },
  {
    id: 'signout',
    label: 'Sign Out',
    icon: <LogoutIcon fontSize="small" />,
    action: 'signout',
    showForVendor: true,
    showForPublic: true,
  },
];

interface NavigationMenuProps {
  isVendorNavbar: boolean;
  variant?: 'menu' | 'list';
  onItemClick?: () => void;
}

export default function NavigationMenu({
  isVendorNavbar,
  variant = 'menu',
  onItemClick,
}: NavigationMenuProps) {
  const { addNotification } = useNotification();
  const supabase = createClient();

  const filteredOptions = navigationOptions.filter(option => {
    if (isVendorNavbar) {
      return option.showForVendor;
    }
    return option.showForPublic;
  });

  const handleNavigationClick = async (option: NavigationOption) => {
    if (onItemClick) {
      onItemClick();
    }

    if (option.action === 'signout') {
      try {
        await supabase.auth.signOut();
        window.location.reload();
        addNotification('Successfully logged out');
      } catch (error) {
        console.error('Error signing out:', error);
        addNotification('Failed to log out', 'error');
      }
    } else if (option.path) {
      const path = option.id === 'settings' && isVendorNavbar
        ? '/partner/settings'
        : option.path;
      window.location.href = path;
    }
  };

  const signOutOption = filteredOptions.find(opt => opt.action === 'signout');
  const otherOptions = filteredOptions.filter(opt => opt.action !== 'signout');

  if (variant === 'list') {
    return (
      <>
        {otherOptions.map((option) => (
          <ListItem key={option.id} disablePadding>
            <ListItemButton onClick={() => handleNavigationClick(option)}>
              <ListItemIcon>
                {option.icon}
              </ListItemIcon>
              <ListItemText primary={option.label} />
            </ListItemButton>
          </ListItem>
        ))}
        {signOutOption && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigationClick(signOutOption)}>
              <ListItemIcon>
                {signOutOption.icon}
              </ListItemIcon>
              <ListItemText primary={signOutOption.label} />
            </ListItemButton>
          </ListItem>
        )}
      </>
    );
  }

  return (
    <>
      {otherOptions.map((option) => (
        <MenuItem key={option.id} onClick={() => handleNavigationClick(option)}>
          <ListItemIcon>
            {option.icon}
          </ListItemIcon>
          <ListItemText>
            <Typography sx={{ textDecoration: 'none', color: 'inherit' }}>
              {option.label}
            </Typography>
          </ListItemText>
        </MenuItem>
      ))}
      {signOutOption && (
        <>
          <Divider />
          <MenuItem onClick={() => handleNavigationClick(signOutOption)}>
            <ListItemIcon>
              {signOutOption.icon}
            </ListItemIcon>
            <ListItemText>
              <Typography sx={{ textDecoration: 'none', color: 'inherit' }}>
                {signOutOption.label}
              </Typography>
            </ListItemText>
          </MenuItem>
        </>
      )}
    </>
  );
}
