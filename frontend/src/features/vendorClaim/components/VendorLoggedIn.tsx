"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";

interface AlreadyLoggedInProps {
  email: string;
  onSignOut: () => void;
}

export default function AlreadyLoggedIn({ email, onSignOut }: AlreadyLoggedInProps) {
  const router = useRouter();

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
          You&apos;re already logged in
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Currently signed in as{" "}
          <Box component="span" sx={{ fontWeight: 500, color: "text.primary" }}>
            {email}
          </Box>
          . Log out to claim a different profile.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button
            variant="contained"
            onClick={() => router.push("/partner/dashboard")}
            fullWidth
          >
            Go to my dashboard
          </Button>
          <Button variant="outlined" onClick={onSignOut} fullWidth>
            Log out
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}