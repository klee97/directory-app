"use client";

import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { checkAdminStatus } from '@/features/admin/api/checkAdminStatus';
import AdminLoadingSpinner from '@/features/admin/components/LoadingSpinner';
import Button from '@mui/material/Button';

export default function Admin() {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        checkAdminStatus(supabase, setLoading, setIsAdmin);
    }, [router, supabase]);

    if (loading) {
        return (
            <AdminLoadingSpinner />
        );
    }

    if (!isAdmin) {
        return null; // This shouldn't render as the router.push above should redirect
    }

    return (
        <Container maxWidth="lg">
            <br />
            <Box
                sx={{
                    my: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    textAlign: 'left',
                    gap: 2,
                    marginBottom: 8,
                }}
            >
                <Typography variant="h2" component="h2" gutterBottom>
                    Admin Dashboard
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 4,
                    }}
                >
                    <Button color="primary" href="/admin/create" variant="text">
                        <Typography variant="body1">
                            Add New Vendor
                        </Typography>
                    </Button>
                    <Button color="primary" href="/admin/update" variant="text">
                        <Typography variant="body1">
                            Update Existing Vendor
                        </Typography>
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}