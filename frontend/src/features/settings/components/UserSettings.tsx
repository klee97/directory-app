"use client";

import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
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
import TextField from "@mui/material/TextField";
import Favorite from "@mui/icons-material/Favorite";
import Lock from "@mui/icons-material/Lock";
import Delete from "@mui/icons-material/Delete";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { updatePassword } from "@/features/settings/api/updatePassword";
import { deleteAccount } from "@/features/settings/api/deleteAccount";
import ChangePasswordDialog from "./ChangePasswordDialog";

interface ApiError extends Error {
  message: string;
}

type UserSettingsProps = {
  userEmail: string | undefined;
};

export const UserSettings = ({ userEmail }: UserSettingsProps) => {
  const { addNotification } = useNotification();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  const isUserEmailVerified = userEmail != undefined && userEmail != null && userEmail.trim() !== '';

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoading, isLoggedIn, router]);

  const handlePasswordChange = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    setIsSubmitting(true);
    try {
      await updatePassword(currentPassword, newPassword);
      addNotification('Password updated successfully');
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

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        isUserEmailVerified={isUserEmailVerified}
        isSubmitting={isSubmitting}
        onSubmit={handlePasswordChange}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            This action cannot be undone. All your favorites will be permanently deleted.
          </Typography>
          <TextField
            fullWidth
            type={showDeletePassword ? "text" : "password"}
            label="Current Password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            margin="normal"
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowDeletePassword(!showDeletePassword)} edge="end">
                      {showDeletePassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error" disabled={isSubmitting}>
            {isSubmitting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
