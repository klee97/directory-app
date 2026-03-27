import BaseCard from "./BaseCard";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Checklist from "@/components/ui/Checklist";

export default function PremiumWaitlistCard() {

  const features = [
    "Boosted visibility in search results",
    "Upload more photos to showcase your work",
    "Improved SEO for better discoverability"
  ];

  return (
    <BaseCard title="Join Premium" icon={<TrendingUpIcon sx={{ color: "text.primary" }} />}>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Interested in getting more visibility? We&apos;re working on Premium profiles that wil help you stand out, with features like:
      </Typography>

      <Checklist items={features.map(f => ({ label: f }))} />

      <Button
        variant="contained"
        href="https://docs.google.com/forms/d/e/1FAIpQLSfTTBguAALwrR2bT6qvfvxcx4F8WmNMpUVrFJg-ZEng0WjCcg/viewform?usp=header"
        sx={{
          bgcolor: "primary.main",
          color: "white",
          alignSelf: "flex-start",
          "&:hover": {
            bgcolor: "primary.dark",
          },
        }}
      >
        Join Waitlist
      </Button>
    </BaseCard>
  );
}