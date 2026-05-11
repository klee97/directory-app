"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { validatePassword } from "@/utils/passwordValidation";

type Props = {
  open: boolean;
  onClose: () => void;
  isUserEmailVerified: boolean;
  isSubmitting: boolean;
  onSubmit: (currentPassword: string, newPassword: string, confirmPassword: string) => void;
};

export default function ChangePasswordDialog({
  open,
  onClose,
  isUserEmailVerified,
  isSubmitting,
  onSubmit,
}: Props) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setPasswordError(validation.message);
      return;
    }
    setPasswordError(null);
    onSubmit(currentPassword, newPassword, confirmPassword);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{"Change Password"}</DialogTitle>
      <DialogContent>
        {isUserEmailVerified ? (
          <form onSubmit={handleSubmit}>
            <TextField
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
              <Button onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </Box>
          </form>
        ) : (
          <Typography variant="body1" color="info" sx={{ mt: 2, mb: 2 }}>
            Verify your email address to create a password. Please check your inbox for a verification email. <p /> Click &quot;Change Email&quot; to send a new verification email.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
