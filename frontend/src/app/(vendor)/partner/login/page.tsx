"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoginForm } from "@/features/login/components/LoginForm";
import Alert from "@mui/material/Alert";

function VendorLoginPageContent() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      // Feature flag
      if (process.env.NEXT_PUBLIC_FEATURE_VENDOR_LOGIN_ENABLED !== "true") {
        router.push(`/`);
        return;
      }

      // Already logged in? → Redirect to vendor dashboard
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.push(`/partner/manage`);
        return;
      }

      setIsLoading(false);
    };

    init();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            gap: 2
          }}
        >
          <CircularProgress />
          <Typography>Logging in...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <br />
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      
      <Typography variant="h1" gutterBottom sx={{ mt: 2 }}>
        Vendor Login
      </Typography>

      <LoginForm isVendorLogin={true} />
    </Container>
  );
}

export default function VendorLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VendorLoginPageContent />
    </Suspense>
  );
}
