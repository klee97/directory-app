import BaseCard from "./BaseCard";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import WorkspacePremium from '@mui/icons-material/WorkspacePremium';
export default function BadgeToolkitCard() {
  const router = useRouter();

  return (
    <BaseCard title="Badge Toolkit" titleHref="/partner/dashboard/badge-toolkit" icon={<WorkspacePremium sx={{ color: 'text.primary' }} />} hoverable>
        <Typography variant="body1" sx={{ mb: 2 }} gutterBottom>
          Display your Asian Wedding Makeup vendor badge on your website to show off your expertise in Asian features.
        </Typography>

        <Button
          variant="contained"
          onClick={() => router.push(`/partner/dashboard/badge-toolkit`)}
        >
          Get Your Badge
        </Button>
    </BaseCard>
  );
}