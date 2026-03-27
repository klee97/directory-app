import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PersonAvatar from "@/components/ui/UserAvatar";

interface BusinessStripProps {
  name: string;
  email: string;
}

export default function BusinessStrip({ name, email }: BusinessStripProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 6,
        py: 1.5,
        bgcolor: "grey.50",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <PersonAvatar />
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {email}
        </Typography>
      </Box>
    </Box>
  );
}