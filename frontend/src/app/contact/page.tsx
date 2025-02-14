import { Container, Typography } from "@mui/material";
import { EmailForm } from "@/features/contact/components/EmailForm";

export default function ContactUs() {
  return (
    <Container maxWidth="sm">
      <br />
      <Typography variant="h2" gutterBottom sx={{ mt: 2 }}>
        Contact Us
      </Typography>
      <Typography variant="body1" gutterBottom>
        Have questions? Want to recommend a vendor or update a listing? Fill out the form below.
      </Typography>
      <EmailForm />
    </Container>
  );
}
