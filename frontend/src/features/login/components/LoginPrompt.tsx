"use client";
import React from 'react';
import { DialogActions, DialogTitle, Button, IconButton, Dialog } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';


type LoginPromptProps = {
  message?: string;
  onLoginSuccess?: () => void;
  onCancel?: () => void;
};

export default function LoginPrompt({
  message = "Please log in to continue",
  onLoginSuccess,
  onCancel
}: LoginPromptProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const { isLoggedIn } = useAuth();

  // Close the prompt if user becomes logged in
  if (isLoggedIn && isOpen) {
    setIsOpen(false);
    onLoginSuccess?.();
  }
  const handleClose = () => {
    setIsOpen(false);
    onCancel?.();
  };

  if (!isOpen) return null;
  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      PaperProps={{
        sx: {
          overflowX: 'hidden', // 👈 kills horizontal scroll
        },
      }}
    >
      <DialogTitle sx={{ position: 'relative', paddingRight: '40px' }}>
        {message}
        <IconButton
          edge="end"
          color="inherit"
          onClick={() => {
            setIsOpen(false);
            onCancel?.();
          }}
          aria-label="close"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
        <Link href={`/login`} style={{ textDecoration: "none", color: "inherit" }}>
          <Button color="primary" variant="contained">
            Login
          </Button>
        </Link>
      </DialogActions>
    </Dialog>
  )
};

