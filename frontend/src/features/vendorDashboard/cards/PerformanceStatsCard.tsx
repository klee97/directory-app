"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";


export default function PerformanceStatsCard() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Performance Stats
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Coming Soon...
        </Typography>
      </CardContent>
    </Card>
  );
}