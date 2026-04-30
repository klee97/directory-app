import BaseCard from "./BaseCard";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export default function PremiumWaitlistCard() {

  // const features = [
  //   "Boosted visibility in search results",
  //   "Upload more photos to showcase your work",
  //   "Improved SEO for better discoverability"
  // ];

  return (
    <BaseCard title="Join Premium" icon={<TrendingUpIcon sx={{ color: "text.primary" }} />}>

      <Typography variant="body1" sx={{ mb: 2 }}>
        We&apos;re working on Premium profiles for even more tools and visibility. Join our waitlist for early access and updates!
      </Typography>

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