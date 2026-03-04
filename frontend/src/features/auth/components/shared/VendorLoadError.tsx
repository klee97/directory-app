"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/system/Box";
import Button from "@mui/material/Button";
import Container from "@mui/system/Container";
import Refresh from "@mui/icons-material/Refresh";
import Typography from "@mui/material/Typography";

export default function VendorLoadError() {
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