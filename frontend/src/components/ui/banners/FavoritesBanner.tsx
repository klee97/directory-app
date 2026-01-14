"use client";
import CTABanner from './CTABanner';
import FavoriteIcon from '@mui/icons-material/Favorite';

interface FavoritesBannerProps {
  onClose?: () => void;
}

export default function FavoritesBanner({ onClose }: FavoritesBannerProps) {
  return (
    <CTABanner
      bannerKey="feature-favorites-banner-dismissed"
      icon={<FavoriteIcon sx={{ fontSize: 20 }} />}
      title="Save your favorite artists for later"
      description={process.env.NEXT_PUBLIC_BANNER_TEXT ?? "Create an account to save your favorite artists for easy access!"}
      actionUrl="/signup"
      buttonText="Sign Up Now"
      onClose={onClose}
    />
  );
}