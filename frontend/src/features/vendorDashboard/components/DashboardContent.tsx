"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import RecentInquiriesCard from "@/features/vendorDashboard/components/cards/RecentInquiriesCard";
import { PortalVendor } from "@/types/vendor";
import ProfileEditCard from "./cards/ProfileEditCard";
import Link from "@mui/material/Link";
import PhotoPromptBanner from "@/components/ui/banners/PhotoPromptBanner";
import BadgeToolkitCard from "./cards/BadgeToolkitCard";
import PremiumWaitlistCard from "./cards/PremiumCard";
import PhotoReviewCard from "./cards/PhotoReviewCard";
import { updateMediaConsent } from "@/features/vendorDashboard/actions/mediaActions";
import { useNotification } from "@/contexts/NotificationContext";
import Visibility from "@mui/icons-material/Visibility";
import WebsiteInterestCard from "./cards/WebsiteInterestCard";
import { Divider } from "@mui/material";

interface DashboardContentProps {
  vendor: PortalVendor;
}

export default function DashboardContent({ vendor }: DashboardContentProps) {
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
          <Link
            href={`/vendors/${vendor.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            color="info.main"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <Visibility fontSize="small" />
            See how your profile looks to clients
          </Link>
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
            <ProfileEditCard vendor={vendor} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <RecentInquiriesCard isApproved={!!vendor.approved_inquiries_at} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ mt: 3 }} />
          </Grid>

          {/* Section with vendor resources */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h3" sx={{ mt: 2 }}>
              Grow Your Business
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <WebsiteInterestCard
              vendorId={vendor.id}
              businessName={vendor.business_name!}
              alreadySubmitted={vendor.website_interest_submitted ?? false}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <BadgeToolkitCard />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <PremiumWaitlistCard
              vendorId={vendor.id}
              businessName={vendor.business_name!}
              alreadySubmitted={vendor.premium_interest_submitted ?? false}
            >
            </PremiumWaitlistCard>
          </Grid>

        </Grid>
      </Box>
    </Container>
  );
}