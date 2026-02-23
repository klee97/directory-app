"use client";
import { Info } from '@mui/icons-material';
import CTABanner from './CTABanner';

interface PhotoPromptProps {
  onClose?: () => void;
}

export default function PhotoPromptBanner({ onClose }: PhotoPromptProps) {
  return (
    <CTABanner
      bannerKey="photo-prompt-banner-dismissed"
      icon={<Info sx={{ fontSize: 20 }} />}
      title="Add a client photo to get more engagement!"
      description="Artist profiles with photos receive more than twice the views from brides."
      actionUrl="/partner/dashboard/profile"
      buttonText="Add Photo"
      onClose={onClose}
      fullWidth
      showCloseButton={false}
    />
  );
}