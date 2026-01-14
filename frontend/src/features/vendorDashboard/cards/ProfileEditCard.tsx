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

interface ProfileChecklistCardProps {
  vendor: VendorByDistance;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

export default function ProfileChecklistCard({ vendor }: ProfileChecklistCardProps) {
  const checklistItems: ChecklistItem[] = [
    {
      id: 'basic_info',
      label: 'Basic Business Info',
      description: 'List your business name, location, and links.',
      completed: !!vendor.business_name,
    },
    {
      id: 'bio',
      label: 'Bio',
      description: 'Write a compelling bio to let clients know who you are. We recommend at least 50 words.',
      completed: !!(vendor.description && vendor.description.split(' ').length >= 50),
    },
    {
      id: 'photo',
      label: 'Client Photo',
      description: 'Upload a photo of your work.',
      completed: vendor.images.length > 0,
    },
  ];


  return (
    <BaseCard title="Edit Profile Page" icon={<Edit sx={{ color: 'text.primary' }}/>}>
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
                fontWeight={500}
                sx={{
                  color: item.completed ? 'text.secondary' : 'text.primary',
                }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="caption"
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