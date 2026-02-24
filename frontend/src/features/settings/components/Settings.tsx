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
import Email from "@mui/icons-material/Email";
import Favorite from "@mui/icons-material/Favorite";
import Lock from "@mui/icons-material/Lock";
import Delete from "@mui/icons-material/Delete";
import Inbox from "@mui/icons-material/Inbox";
import Link from "next/link";
import MuiLink from "@mui/material/Link";
import Switch from "@mui/material/Switch";
import { updateInquiryAvailability } from "../api/updateInquiryAvailability";
import { revalidateVendor } from "@/lib/actions/revalidate";
import { useRouter } from "next/navigation";
import { updatePassword, updatePasswordAfterReset } from "../api/updatePassword";
import { deleteAccount } from "../api/deleteAccount";
import { updateEmail } from "../api/updateEmail";
import { useNotification } from "@/contexts/NotificationContext";
import { validatePassword } from "@/utils/passwordValidation";
import { createClient } from "@/lib/supabase/client";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";

interface ApiError extends Error {
  message: string;
}

type SettingsProps = {
  isVendorSettings: boolean;
  userEmail: string | undefined;
  hasPassword: boolean;
  vendorId?: string;
  vendorSlug?: string;
  approvedInquiriesAt?: string | null;
};

export const Settings = ({
  isVendorSettings,
  userEmail,
  hasPassword,
  vendorId,
  vendorSlug,
  approvedInquiriesAt,
}: SettingsProps) => {
  const { addNotification } = useNotification();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hasPasswordState, setHasPasswordState] = useState(hasPassword);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [email, setNewEmail] = useState('');
  const [emailChangePassword, setEmailChangePassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Password visibility for updating email
  const [showPassword, setShowPassword] = useState(false);

  // Password visibility for changing password
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password visibility for deleting account
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  // Vendor inquiries setting
  const [inquiryEnabled, setInquiryEnabled] = useState(!!approvedInquiriesAt);
  const [isUpdatingInquiry, setIsUpdatingInquiry] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const isUserEmailVerified = userEmail != undefined && userEmail != null && userEmail.trim() !== '';

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

    if (!hasPasswordState) {
      if (newPassword !== confirmPassword) {
        addNotification('New passwords do not match', 'error');
        setIsSubmitting(false);
        return;
      }
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setPasswordError(validation.message);
      setIsSubmitting(false);
      return;
    }

    try {
      if (hasPasswordState) {
        await updatePassword(currentPassword, newPassword);
      } else {
        await updatePasswordAfterReset(newPassword, isVendorSettings);
      }
      addNotification('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setHasPasswordState(true);
      setPasswordDialogOpen(false);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      addNotification(apiError.message || 'Failed to update password', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if email is the same as current
    if (email.trim() === '' || email.toLowerCase() === userEmail?.toLowerCase()) {
      addNotification('New email address must be different from current email', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateEmail(emailChangePassword, email, isVendorSettings);

      addNotification(
        'Check your inbox to verify your new vendor account email address: ' + email,
        'success'
      );

      setNewEmail('');
      setEmailChangePassword('');
      setEmailDialogOpen(false);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      addNotification(
        apiError.message || 'Failed to update email address',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInquiryToggle = async () => {
    if (!vendorId) return;
    const newValue = !inquiryEnabled;
    setInquiryEnabled(newValue);
    setIsUpdatingInquiry(true);
    try {
      await updateInquiryAvailability(vendorId, newValue);
      if (vendorSlug) {
        await revalidateVendor(vendorSlug);
      }
      addNotification(newValue ? 'Bridal inquiries enabled' : 'Bridal inquiries disabled');
    } catch (error: unknown) {
      setInquiryEnabled(!newValue);
      const apiError = error as ApiError;
      addNotification(apiError.message || 'Failed to update inquiry settings', 'error');
    } finally {
      setIsUpdatingInquiry(false);
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
        {!isVendorSettings && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/favorites">
                <ListItemIcon>
                  <Favorite />
                </ListItemIcon>
                <ListItemText primary="View Favorites" secondary="See the makeup artists that you have favorited" />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1, borderColor: 'rgba(0, 0, 0, 0.08)' }} />
          </>
        )}
        {isVendorSettings && (
          <>
            <ListItem
              secondaryAction={
                <Switch
                  checked={inquiryEnabled}
                  onChange={handleInquiryToggle}
                  disabled={isUpdatingInquiry || !vendorId}
                />
              }
            >
              <ListItemIcon>
                <Inbox />
              </ListItemIcon>
              <ListItemText
                sx={{ pr: 8 }}
                primary="Bridal Inquiries"
                secondary={
                  <span>
                    {inquiryEnabled
                      ? 'You are enrolled to receive inquiries from prospective clients through Asian Wedding Makeup. '
                      : 'Enroll to receive inquiries from prospective clients through Asian Wedding Makeup. '}
                    <MuiLink component={Link} href="/partner" target="_blank" rel="noopener noreferrer">
                      Learn More
                    </MuiLink>
                  </span>
                }
              />
            </ListItem>
            <Divider sx={{ my: 1, borderColor: 'rgba(0, 0, 0, 0.08)' }} />
          </>
        )}
        {isVendorSettings &&
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setEmailDialogOpen(true)}>
                <ListItemIcon>
                  <Email />
                </ListItemIcon>
                <ListItemText primary="Change Email" secondary="Update your email address" />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1, borderColor: 'background.paper' }} />
          </>
        }
        <ListItem disablePadding>
          {isUserEmailVerified && (
            <ListItemButton onClick={() => setPasswordDialogOpen(true)}>
              <ListItemIcon>
                <Lock />
              </ListItemIcon>
              {hasPasswordState && <ListItemText primary="Change Password" secondary="Update your password" />}
              {!hasPasswordState && <ListItemText primary="Create A Password" secondary="Create a password to login to your account" />}
            </ListItemButton>
          )}
          {!isUserEmailVerified && (
            <ListItemButton onClick={() => setPasswordDialogOpen(true)}>
              <ListItemIcon>
                <Lock />
              </ListItemIcon>
              <ListItemText primary="Create A Password" secondary="Create a password to login to your account" />
            </ListItemButton>

          )}
        </ListItem>
        <Divider sx={{ my: 1, borderColor: 'background.paper' }} />
        {!isVendorSettings && (
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
        )}
        {isVendorSettings && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/partner/contact">
                <ListItemIcon>
                  <Delete />
                </ListItemIcon>
                <ListItemText primary="Delete Account" secondary="Contact us to delete your vendor profile" />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1, borderColor: 'rgba(0, 0, 0, 0.08)' }} />
          </>
        )}
      </List>
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{hasPasswordState ? "Change Password" : "Create A Password"}</DialogTitle>
        <DialogContent>
          {isUserEmailVerified && (
            <form onSubmit={handlePasswordChange}>
              {hasPasswordState && (<TextField
                fullWidth
                type={showCurrentPassword ? "text" : "password"}
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                margin="normal"
                required
                disabled={isSubmitting}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />
              )}
              <TextField
                fullWidth
                type={showNewPassword ? "text" : "password"}
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
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
              />
              <TextField
                fullWidth
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                required
                disabled={isSubmitting}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
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
          )}
          {!isUserEmailVerified && (
            <Typography variant="body1" color="info" sx={{ mt: 2, mb: 2 }}>
              Verify your email address to create a password. Please check your inbox for a verification email. <p /> Click &quot;Change Email&quot; to send a new verification email.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={emailDialogOpen}
        onClose={() => {
          setEmailDialogOpen(false);
          setNewEmail('');
          setEmailChangePassword('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update the email address for your account. <br />
          Current email: {userEmail}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleEmailChange}>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Current Password"
              value={emailChangePassword}
              onChange={(e) => setEmailChangePassword(e.target.value)}
              margin="normal"
              required
              disabled={isSubmitting}
              helperText="Enter your current password to update your email address"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />
            <TextField
              fullWidth
              type="email"
              label="New Email Address"
              value={email}
              onChange={(e) => setNewEmail(e.target.value)}
              margin="normal"
              required
              disabled={isSubmitting}
              error={email.trim() !== '' && email.toLowerCase() === userEmail?.toLowerCase()}
              helperText={
                email.trim() !== '' && email.toLowerCase() === userEmail?.toLowerCase()
                  ? "New email address must be different from current email"
                  : ""
              }
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setEmailDialogOpen(false);
              setNewEmail('');
              setEmailChangePassword('');
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEmailChange}
            color="primary"
            variant="contained"
            disabled={isSubmitting || email.trim() === '' || email.toLowerCase() === userEmail?.toLowerCase()}
          >
            {isSubmitting ? 'Updating...' : 'Update Email'}
          </Button>
        </DialogActions>
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