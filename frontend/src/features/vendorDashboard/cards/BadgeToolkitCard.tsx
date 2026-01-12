import BaseCard from "./BaseCard";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import WorkspacePremium from '@mui/icons-material/WorkspacePremium';
export default function BadgeToolkitCard({slug}: {slug: string}) {
  const router = useRouter();

  return (
    <BaseCard title="Badge Toolkit" icon={<WorkspacePremium sx={{ color: 'text.primary' }} />} hoverable>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Display your Asian Wedding Makeup vendor badge on your website to show off your expertise in Asian features.
        </Typography>

        <Button
          variant="contained"
          onClick={() => router.push(`/partner/badge-toolkit/${slug}`)}
        >
          Get Your Badge
        </Button>
    </BaseCard>
  );
}