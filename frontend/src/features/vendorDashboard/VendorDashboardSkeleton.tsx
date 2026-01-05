import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid2";

export default function VendorDashboardSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="40%" height={48} />
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Skeleton variant="rounded" width={90} height={28} />
          <Skeleton variant="rounded" width={110} height={28} />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Status Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="50%" height={32} />
              <Skeleton variant="rectangular" height={1} sx={{ my: 2 }} />

              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="65%" sx={{ mb: 2 }} />

              <Skeleton
                variant="rounded"
                width={140}
                height={32}
                sx={{ mb: 2 }}
              />

              <Skeleton
                variant="rounded"
                width={180}
                height={36}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Inquiries Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="50%" height={32} />
              <Skeleton variant="rectangular" height={1} sx={{ my: 2 }} />

              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="75%" />

              <Skeleton
                variant="rounded"
                width={160}
                height={36}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="30%" height={32} />
              <Skeleton variant="rectangular" height={1} sx={{ my: 2 }} />

              <Box sx={{ display: "flex", gap: 2 }}>
                <Skeleton variant="text" width={120} height={28} />
                <Skeleton variant="text" width={160} height={28} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
