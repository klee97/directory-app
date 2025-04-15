"use client";

import { SignupForm } from "@/features/login/components/SignupForm";
import { Container, Typography, CircularProgress, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is already logged in, redirect to home page
        router.push('/');
      } else {
        // User is not logged in, show the signup form
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [router]);
  
  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '80vh' 
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="sm">
      <br />
      <Typography variant="h1" gutterBottom sx={{ mt: 2 }}>
        Sign Up
      </Typography>
      <SignupForm />
    </Container>
  );
} 