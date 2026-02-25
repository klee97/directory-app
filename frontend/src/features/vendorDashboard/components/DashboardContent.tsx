"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import RecentInquiriesCard from "@/features/vendorDashboard/components/cards/RecentInquiriesCard";
import PerformanceStatsCard from "@/features/vendorDashboard/components/cards/PerformanceStatsCard";
import { VendorByDistance } from "@/types/vendor";
import ProfileEditCard from "./cards/ProfileEditCard";
import Link from "@mui/material/Link";
import PhotoPromptBanner from "@/components/ui/banners/PhotoPromptBanner";
import BadgeToolkitCard from "./cards/BadgeToolkitCard";
import PremiumWaitlistCard from "./cards/PremiumCard";
import PhotoReviewCard from "./cards/PhotoReviewCard";
import { updateMediaConsent } from "../actions/mediaActions";
import { useNotification } from "@/contexts/NotificationContext";

interface DashboardContentProps {
  vendor: VendorByDistance;
  hasUnpublishedDraft: boolean;
}

export default function DashboardContent({ vendor, hasUnpublishedDraft }: DashboardContentProps) {
  const { addNotification } = useNotification();

  const handlePhotoSubmit = async (mediaId: string, credits: string) => {
    const result = await updateMediaConsent({ mediaId, credits, consentGiven: true });
    if (!result.success) {
      console.error(result.error);
      addNotification("Failed to update media. Please try again later.", 'error');
    }
    return result;
  };

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
              color="info.main"
            >
              View current profile page
            </Link>
          </Typography>
        </Box>

        {/* Photo Prompt CTA */}
        {!vendor.cover_image &&
          <Box sx={{ mb: 4 }}>
            <PhotoPromptBanner />
          </Box>
        }

        {/* Review Photo Card */}
        {vendor.cover_image && vendor.cover_image.media_url && !vendor.cover_image.consent_given && (
          <Box sx={{ mb: 4 }}>
            <PhotoReviewCard
              photoUrl={vendor.cover_image.media_url}
              mediaId={vendor.cover_image.id!}
              initialCredits={vendor.cover_image.credits}
              onApprove={handlePhotoSubmit}
            />
          </Box>
        )}

        <Grid container spacing={3}>

          <Grid size={{ xs: 12 }}>
            <ProfileEditCard vendor={vendor} hasUnpublishedDraft={hasUnpublishedDraft} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <RecentInquiriesCard isApproved={!!vendor.approved_inquiries_at} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <BadgeToolkitCard />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <PremiumWaitlistCard />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <PerformanceStatsCard />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}