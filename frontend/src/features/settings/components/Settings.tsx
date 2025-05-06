"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Alert from "@mui/material/Alert";
import Favorite from "@mui/icons-material/Favorite";
import Lock from "@mui/icons-material/Lock";
import Delete from "@mui/icons-material/Delete";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updatePassword } from "../api/updatePassword";
import { deleteAccount } from "../api/deleteAccount";
import { useNotification } from "@/contexts/NotificationContext";
import { validatePassword } from "@/utils/passwordValidation";
import { createClient } from "@/lib/supabase/client";

interface ApiError extends Error {
  message: string;
}

export default function Settings() {
  const { addNotification } = useNotification();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkLogin() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }
    }
    checkLogin();
  }, [router, supabase.auth]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      addNotification('New passwords do not match', 'error');
      setIsSubmitting(false);
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setPasswordError(validation.message);
      setIsSubmitting(false);
      return;
    }

    try {
      await updatePassword(currentPassword, newPassword);
      addNotification('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordDialogOpen(false);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      addNotification(apiError.message || 'Failed to update password', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsSubmitting(true);

    try {
      await deleteAccount(deletePassword);
      addNotification('Account deleted successfully');
      router.push('/');
    } catch (error: unknown) {
      const apiError = error as ApiError;
      addNotification(apiError.message || 'Failed to delete account', 'error');
    } finally {
      setIsSubmitting(false);
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
              slotProps={{ secondary: { color: "error" } }}
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
              disabled={isSubmitting}
            />
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError(null);
              }}
              margin="normal"
              required
              disabled={isSubmitting}
              error={!!passwordError}
              helperText={passwordError}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
              disabled={isSubmitting}
            />
            <Alert severity="info" sx={{ mt: 2 }}>
              Password must contain:
              <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                <Box component="li">At least 8 characters</Box>
                <Box component="li">At least one uppercase letter</Box>
                <Box component="li">At least one lowercase letter</Box>
                <Box component="li">At least one number</Box>
                <Box component="li">At least one special character: {'!@#$%^&*(),.?'}</Box>
              </Box>
            </Alert>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setPasswordDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
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
            disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 