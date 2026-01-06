import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import {
  CheckCircle,
  RadioButtonUnchecked,
  Image as ImageIcon,
  Description,
  Business
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
  icon: React.ReactNode;
}

export default function ProfileChecklistCard({ vendor }: ProfileChecklistCardProps) {
  const checklistItems: ChecklistItem[] = [
    {
      id: 'basic_info',
      label: 'Basic Business Info',
      description: 'List your business name, location, and links',
      completed: !!vendor.business_name,
      icon: <Business />,
    },
    {
      id: 'bio',
      label: 'Bio',
      description: 'Write a compelling bio to let clients know who you are (150+ characters)',
      completed: !!(vendor.description && vendor.description.length >= 150),
      icon: <Description />,
    },
    {
      id: 'photo',
      label: 'Client Photo',
      description: 'Upload a client photo',
      completed: vendor.images.length > 0,
      icon: <ImageIcon />,
    },
  ];


  return (
    <BaseCard title="Edit Profile Page">

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
              <RadioButtonUnchecked sx={{ color: 'info.main', fontSize: 24, flexShrink: 0 }} />
            )}

            {/* Item Icon */}
            <Box
              sx={{
                color: item.completed ? 'grey.500' : 'info.main',
                display: 'flex',
                alignItems: 'center',
                fontSize: 20,
                flexShrink: 0
              }}
            >
              {item.icon}
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
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
        href="/partner/manage/profile"
        variant={"contained"}
        sx={{ bgcolor: "info.main", color: "white" }}
      >
        Edit Profile
      </Button>
    </BaseCard>
  );
}