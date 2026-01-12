import BaseCard from "./BaseCard";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function PremiumWaitlistCard() {

  const features = [
    "Boosted visibility in search results",
    "Upload more photos to showcase your work",
    "Improved SEO for better discoverability"
  ];

  return (
    <BaseCard title="Join Premium" icon={<TrendingUpIcon sx={{ color: "text.primary" }} />}>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Get more bookings with a premium profile:
        </Typography>

        <List dense disablePadding sx={{ mb: 2 }}>
          {features.map((feature, index) => (
            <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon sx={{ fontSize: 20, color: "primary.main" }} />
              </ListItemIcon>
              <ListItemText 
                primary={feature}
                primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
              />
            </ListItem>
          ))}
        </List>

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