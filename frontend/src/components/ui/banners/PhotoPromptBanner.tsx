"use client";
import { Info } from '@mui/icons-material';
import CTABanner from './CTABanner';

interface PhotoPromptProps {
  hasProfilePhoto: boolean;
  onClose?: () => void;
}

export default function PhotoPromptBanner({ hasProfilePhoto, onClose }: PhotoPromptProps) {
  // Don't show if they already have photos
  if (hasProfilePhoto) {
    return null;
  }

  return (
    <CTABanner
      bannerKey="photo-prompt-banner-dismissed"
      icon={<Info sx={{ fontSize: 20 }} />}
      title="Add a client photo to get more engagement!"
      description="Artist profiles with photos receive more than twice the views from brides."
      actionUrl="/partner/manage/profile"
      buttonText="Add Photo"
      onClose={onClose}
      fullWidth
      showCloseButton={false}
    />
  );
}