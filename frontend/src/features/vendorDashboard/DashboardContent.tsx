"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import RecentInquiriesCard from "@/features/vendorDashboard/cards/RecentInquiriesCard";
import PerformanceStatsCard from "@/features/vendorDashboard/cards/PerformanceStatsCard";
import { VendorByDistance } from "@/types/vendor";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Refresh from "@mui/icons-material/Refresh";
import ProfileEditCard from "./cards/ProfileEditCard";
import Link from "@mui/material/Link";
import PhotoPromptBanner from "@/components/ui/banners/PhotoPromptBanner";
import BadgeToolkitCard from "./cards/BadgeToolkitCard";
import PremiumWaitlistCard from "./cards/PremiumCard";

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
          <Typography variant="h3" gutterBottom>
            Welcome, {vendor.business_name}!
          </Typography>
          <Typography variant="body1" color="text.primary" gutterBottom>
            Use this dashboard to manage your business profile and edit your page.
          </Typography>
          <Typography variant="body1" color="text.primary">
            <Link
              href={`/vendors/${vendor.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View current profile page
            </Link>
          </Typography>
        </Box>

        {/* Photo Prompt CTA */}
        {vendor.images.length === 0 && (
          <Box sx={{ mb: 4 }}>
            <PhotoPromptBanner hasProfilePhoto={vendor.images.length > 0} />
          </Box>

        )}

        <Grid container spacing={3}>

          <Grid size={{ xs: 12 }}>
            <ProfileEditCard vendor={vendor} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <BadgeToolkitCard slug={vendor.slug || ""} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <PremiumWaitlistCard />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <RecentInquiriesCard />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <PerformanceStatsCard />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}