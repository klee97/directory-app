"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    Alert,
} from '@mui/material';
import { useNotification } from '@/contexts/NotificationContext';
import { validatePassword } from '@/utils/passwordValidation';
import { createClient } from '@/lib/supabase/client';
import { updatePasswordAfterReset } from '@/features/settings/api/updatePassword';

interface ApiError extends Error {
    message: string;
}

export default function UpdatePasswordAfterResetPage() {
    const { addNotification } = useNotification();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
            await updatePasswordAfterReset(newPassword);
            addNotification('Password updated successfully. Redirecting to login page...');
            await supabase.auth.signOut();
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (error: unknown) {
            const apiError = error as ApiError;
            addNotification(apiError.message || 'Failed to update password', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Update Password
            </Typography>

            <List sx={{
                width: '100%',
                '& .MuiListItemButton-root': {
                    py: 2,
                    justifyContent: 'flex-start',
                }
            }}>
                <ListItem disablePadding>
                    <form onSubmit={handlePasswordChange}>
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
                </ListItem>
            </List>
        </Container>
    );
} 