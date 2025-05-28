"use client";

import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
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
                    <Link href="/admin/create" style={{ textDecoration: "none" }}>
                        <Button color="primary" variant="contained">
                        <Typography variant="body1">
                            Add New Vendor
                        </Typography>
                        </Button>
                    </Link>
                    <Link href="/admin/update" style={{ color: "inherit", textDecoration: "none" }}>
                        <Button color="primary" variant="contained">
                            <Typography variant="body1">
                                Update Existing Vendor
                            </Typography>
                        </Button>
                    </Link>
                </Box>
            </Box>
        </Container>
    );
}