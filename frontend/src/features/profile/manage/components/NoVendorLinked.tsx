import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";

export default function NoVendorLinked() {
  return (
    <Container maxWidth="sm">
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center'
      }}>
        <Typography variant="h4" gutterBottom>
          No Vendor Profile Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          You don&apos;t have a vendor profile linked to your account yet.
        </Typography>
        <Button
          component={Link}
          href="/partner/onboarding"
          variant="contained"
          size="large"
        >
          Create Vendor Profile
        </Button>
      </Box>
    </Container>
  );
}