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
import Switch from "@mui/material/Switch";
import Email from "@mui/icons-material/Email";
import Lock from "@mui/icons-material/Lock";
import Delete from "@mui/icons-material/Delete";
import Inbox from "@mui/icons-material/Inbox";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Link from "next/link";
import MuiLink from "@mui/material/Link";
import { useRouter } from "next/navigation";
import { useNotification } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { updatePassword } from "@/features/settings/api/updatePassword";
import { updateEmail } from "@/features/settings/api/updateEmail";
import { updateInquiryAvailability } from "@/features/settings/api/updateInquiryAvailability";
import { revalidateVendor } from "@/lib/actions/revalidate";
import ChangePasswordDialog from "./ChangePasswordDialog";

type VendorSettingsProps = {
  userEmail: string;
  vendorId: string;
  vendorSlug?: string;
  approvedInquiriesAt?: string | null;
};

export const VendorSettings = ({
  userEmail,
  vendorId,
  vendorSlug,
  approvedInquiriesAt,
}: VendorSettingsProps) => {
  const { addNotification } = useNotification();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setNewEmail] = useState('');
  const [emailChangePassword, setEmailChangePassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquiryEnabled, setInquiryEnabled] = useState(!!approvedInquiriesAt);
  const [isUpdatingInquiry, setIsUpdatingInquiry] = useState(false);

  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  const isUserEmailVerified = userEmail.trim() !== '';

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/partner/login');
    }
  }, [isLoading, isLoggedIn, router]);

  const handlePasswordChange = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    if (newPassword !== confirmPassword) {
      addNotification('New passwords do not match', 'error');
      return;
    }
    setIsSubmitting(true);
    const result = await updatePassword(userEmail, currentPassword, newPassword);
    if (result?.error) {
      addNotification(result.error || 'Failed to update password', 'error');
    } else {
      addNotification('Password updated successfully');
      setPasswordDialogOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === '' || email.toLowerCase() === userEmail.toLowerCase()) {
      addNotification('New email address must be different from current email', 'error');
      return;
    }
    setIsSubmitting(true);
    const result = await updateEmail(userEmail, emailChangePassword, email, true);
    if (result?.error) {
      addNotification(result.error || 'Failed to update email address', 'error');
    } else {
      addNotification(
        'Check your inbox to verify your new vendor account email address: ' + email,
        'success'
      );
      setNewEmail('');
      setEmailChangePassword('');
      setEmailDialogOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleInquiryToggle = async () => {
    const newValue = !inquiryEnabled;
    setInquiryEnabled(newValue);
    setIsUpdatingInquiry(true);
    const result = await updateInquiryAvailability(vendorId, newValue);
    if (result?.error) {
      addNotification(result.error || 'Failed to update inquiry settings', 'error');
    } else {
      if (vendorSlug) {
        await revalidateVendor(vendorSlug);
      }
      addNotification(newValue ? 'Bridal inquiries enabled' : 'Bridal inquiries disabled');
    }
    setIsUpdatingInquiry(false);
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
        <ListItem
          secondaryAction={
            <Switch
              checked={inquiryEnabled}
              onChange={handleInquiryToggle}
              disabled={isUpdatingInquiry}
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

        <ListItem disablePadding>
          <ListItemButton onClick={() => setEmailDialogOpen(true)}>
            <ListItemIcon>
              <Email />
            </ListItemIcon>
            <ListItemText primary="Change Email" secondary="Update your email address" />
          </ListItemButton>
        </ListItem>
        <Divider sx={{ my: 1, borderColor: 'background.paper' }} />

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
          <ListItemButton component={Link} href="/partner/contact">
            <ListItemIcon>
              <Delete />
            </ListItemIcon>
            <ListItemText primary="Delete Account" secondary="Contact us to delete your vendor profile" />
          </ListItemButton>
        </ListItem>
        <Divider sx={{ my: 1, borderColor: 'rgba(0, 0, 0, 0.08)' }} />
      </List>

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        isUserEmailVerified={isUserEmailVerified}
        isSubmitting={isSubmitting}
        onSubmit={handlePasswordChange}
      />

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
        <DialogTitle>
          Update the email address for your account. <br />
          Current email: {userEmail}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleEmailChange}>
            <TextField
              fullWidth
              type={showEmailPassword ? "text" : "password"}
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
                      <IconButton onClick={() => setShowEmailPassword(!showEmailPassword)} edge="end">
                        {showEmailPassword ? <VisibilityOff /> : <Visibility />}
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
              error={email.trim() !== '' && email.toLowerCase() === userEmail.toLowerCase()}
              helperText={
                email.trim() !== '' && email.toLowerCase() === userEmail.toLowerCase()
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
    </Container>
  );
};
