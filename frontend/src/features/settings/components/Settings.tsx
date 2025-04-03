"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Lock, Delete, Favorite } from '@mui/icons-material';
import { updatePassword } from '../api/updatePassword';
import { deleteAccount } from '../api/deleteAccount';
import { toast } from 'react-hot-toast';

interface ApiError extends Error {
  message: string;
}

export function Settings() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const router = useRouter();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Updating password...');

    if (newPassword !== confirmPassword) {
      toast.dismiss(loadingToast);
      toast.error('New passwords do not match');
      return;
    }

    try {
      await updatePassword(currentPassword, newPassword);
      toast.dismiss(loadingToast);
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordDialogOpen(false);
    } catch (error: unknown) {
      toast.dismiss(loadingToast);
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to update password');
    }
  };

  const handleDeleteAccount = async () => {
    const loadingToast = toast.loading('Deleting account...');

    try {
      await deleteAccount(deletePassword);
      toast.dismiss(loadingToast);
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (error: unknown) {
      toast.dismiss(loadingToast);
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to delete account');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Account Settings
      </Typography>

      <List sx={{ 
        width: '100%',
        '& .MuiListItemButton-root': {
          py: 2,
          justifyContent: 'flex-start',
        }
      }}>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/favorites">
            <ListItemIcon>
              <Favorite />
            </ListItemIcon>
            <ListItemText primary="View Favorites" secondary="See the makeup artists that you have favorited" />
          </ListItemButton>
        </ListItem>
        <Divider sx={{ my: 1, borderColor: 'rgba(0, 0, 0, 0.08)' }} />
        <ListItem disablePadding>
          <ListItemButton onClick={() => setPasswordDialogOpen(true)}>
            <ListItemIcon>
              <Lock />
            </ListItemIcon>
            <ListItemText primary="Change Password" secondary="Update your password" />
          </ListItemButton>
        </ListItem>
        <Divider sx={{ my: 1, borderColor: 'background.paper' }} />
        <ListItem disablePadding>
          <ListItemButton onClick={() => setDeleteDialogOpen(true)}>
            <ListItemIcon>
              <Delete color="error" />
            </ListItemIcon>
            <ListItemText 
              primary="Delete Account" 
              secondary="Delete your account and data. This action cannot be undone"
              slotProps={{secondary: {color: "error"}}}
            />
          </ListItemButton>
        </ListItem>
      </List>

      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <form onSubmit={handlePasswordChange}>
            <TextField
              fullWidth
              type="password"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Update Password
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            This action cannot be undone. All your favorites will be permanently deleted.
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 