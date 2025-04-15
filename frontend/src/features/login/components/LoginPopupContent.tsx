"use client";
import React from 'react';
import { DialogActions, DialogTitle, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';

export const LoginPopupContent = ({handleClose} : { handleClose: () => void}) =>
(
    <>
        <DialogTitle sx={{ position: 'relative', paddingRight: '40px' }}>
            Login or create an account to save favorites!
            <IconButton
                edge="end"
                color="inherit"
                onClick={handleClose}
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
            <Link href={`/login?redirectTo=/favorites`} style={{ textDecoration: "none", color: "inherit" }}>
                <Button color="primary" variant="contained">
                    Login
                </Button>
            </Link>
        </DialogActions>
    </>
);

