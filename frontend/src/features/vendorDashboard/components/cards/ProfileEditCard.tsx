import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import {
  CheckCircle,
  RadioButtonUnchecked,
  Edit
} from "@mui/icons-material";
import { VendorByDistance } from "@/types/vendor";
import BaseCard from "./BaseCard";
import { RECOMMENDED_BIO_WORD_COUNT } from "@/features/profile/dashboard/components/EditFormView";
import Alert from "@mui/material/Alert";

interface ProfileChecklistCardProps {
  vendor: VendorByDistance;
  userId: string;
  hasUnpublishedDraft: boolean;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

export default function ProfileChecklistCard({ vendor, hasUnpublishedDraft }: ProfileChecklistCardProps) {
  const checklistItems: ChecklistItem[] = [
    {
      id: 'basic_info',
      label: 'Basic Business Info',
      description: 'List your services, business name, location, and links.',
      completed: !!(vendor.business_name && vendor.longitude && vendor.latitude && vendor.tags.length > 0 && vendor.instagram),
    },
    {
      id: 'bio',
      label: 'Detailed Bio',
      description: `Write a compelling bio to let clients know who you are. We recommend at least ${RECOMMENDED_BIO_WORD_COUNT} words.`,
      completed: !!(vendor.description && vendor.description.split(' ').length >= RECOMMENDED_BIO_WORD_COUNT),
    },
    {
      id: 'photo',
      label: 'Client Photo',
      description: 'Upload a photo of your work.',
      completed: vendor.images.length > 0,
    },
  ];

  return (
    <BaseCard title="Edit Profile Page" titleHref="/partner/dashboard/profile" icon={<Edit sx={{ color: 'text.primary' }} />}>
      {hasUnpublishedDraft && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You have unpublished changes.
        </Alert>
      )}
      {/* Checklist Items */}
      <Box sx={{ mb: 3 }}>
        {checklistItems.map((item, index) => (
          <Box
            key={item.id}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              py: 1.5,
              borderBottom: index < checklistItems.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
              transition: 'background-color 0.2s',
            }}
          >
            {/* Checkbox Icon */}
            {item.completed ? (
              <CheckCircle sx={{ color: 'grey.400', fontSize: 24, flexShrink: 0 }} />
            ) : (
              <RadioButtonUnchecked sx={{ color: 'text.primary', fontSize: 24, flexShrink: 0 }} />
            )}

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body1"
                fontWeight={item.completed ? 500 : 600}
                sx={{
                  color: item.completed ? 'text.secondary' : 'text.primary',
                }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ display: 'block' }}
              >
                {item.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Action Button */}
      <Button
        component={Link}
        href="/partner/dashboard/profile"
        variant={"contained"}
      >
        Edit Profile
      </Button>
    </BaseCard>
  );
}