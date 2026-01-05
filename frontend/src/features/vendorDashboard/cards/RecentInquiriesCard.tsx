"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

export default function RecentInquiriesCard() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">
          Inquiries
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Coming Soon...
        </Typography>
      </CardContent>
    </Card>
  );
}