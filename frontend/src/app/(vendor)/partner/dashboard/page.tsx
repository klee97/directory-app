import { redirect } from "next/navigation";

import { getCurrentUserAction } from "@/lib/auth/actions/getUser";
import DashboardContent from "@/features/vendorDashboard/components/DashboardContent";
import { getVendorForCurrentUser } from "@/features/profile/dashboard/api/getVendorForCurrentUser";
import { loadUnpublishedDraft } from "@/features/profile/dashboard/api/updateDrafts";
import Container from "@mui/system/Container";
import Alert from "@mui/material/Alert";
import Box from "@mui/system/Box";
import Button from "@mui/material/Button";
import Refresh from "@mui/icons-material/Refresh";
import Typography from "@mui/material/Typography";


export default async function VendorDashboardPage() {
  const currentUser = await getCurrentUserAction();

  if (!currentUser || !currentUser.userId) {
    redirect("/partner/login?redirect=/partner/dashboard");
  }

  // Fetch vendor data server-side
  const vendor = await getVendorForCurrentUser(currentUser.userId);

  if (!vendor) {
    console.error("DashboardContent: vendor is null - this should not happen");

    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 6 }}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<Refresh />}
                onClick={() => window.location.reload()}
              >
                Reload
              </Button>
            }
          >
            <Typography variant="body1" fontWeight={500}>
              Unable to load your vendor profile
            </Typography>
            <Typography variant="body2">
              Please try refreshing the page. If the problem persists, contact support.
            </Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  const existingDraft = await loadUnpublishedDraft(vendor.id, currentUser.userId);
  const hasUnpublishedDraft = !!existingDraft;

  return <DashboardContent vendor={vendor} hasUnpublishedDraft={hasUnpublishedDraft} />;
}