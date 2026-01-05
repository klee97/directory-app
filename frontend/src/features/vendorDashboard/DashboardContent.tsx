"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import PhotoPrompt from "@/features/vendorDashboard/cards/PhotoPromptCard";
import RecentInquiriesCard from "@/features/vendorDashboard/cards/RecentInquiriesCard";
import PerformanceStatsCard from "@/features/vendorDashboard/cards/PerformanceStatsCard";
import { VendorByDistance } from "@/types/vendor";
import Button from "@mui/material/Button";
import Link from "next/link";
import { Edit } from "@mui/icons-material";
import Alert from "@mui/material/Alert";
import Refresh from "@mui/icons-material/Refresh";

interface DashboardContentProps {
  vendor: VendorByDistance | null;
}

export default function DashboardContent({ vendor }: DashboardContentProps) {
  if (!vendor) {
    console.error("DashboardContent: vendor is null - this should not happen");
    
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 6 }}>
          <Alert 
            severity="error"
            action={
              <Button 
                color="inherit" 
                size="small"
                startIcon={<Refresh />}
                onClick={() => window.location.reload()}
              >
                Reload
              </Button>
            }
          >
            <Typography variant="body1" fontWeight={500}>
              Unable to load your vendor profile
            </Typography>
            <Typography variant="body2">
              Please try refreshing the page. If the problem persists, contact support.
            </Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {vendor.business_name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your business profile and edit your page.
          </Typography>
          <Button
            component={Link}
            href="/partner/manage/profile"
            variant="outlined"
            startIcon={<Edit/>}
            sx={{ flexShrink: 0 }}
          >
            Edit Profile
          </Button>
        </Box>

        {/* Photo Prompt (dismissible) */}
        <PhotoPrompt hasProfilePhoto={vendor.images.length > 0} />

        <Grid container spacing={3}>
          {/* Recent Inquiries Card */}
          <Grid size={{ xs: 12, md: 8 }}>
            <RecentInquiriesCard />
          </Grid>

          {/* Performance Stats */}
          <Grid size={{ xs: 12 }}>
            <PerformanceStatsCard />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}