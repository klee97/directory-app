import { Container, Typography } from "@mui/material";
import { EmailForm } from "@/features/contact/components/EmailForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Asian Wedding Hair & Makeup",
  description: "Need help finding a wedding artist? Want to recommend a hair and makeup artist, or update a listing? Get in touch with us.",
  alternates: {
    canonical: "https://www.asianweddingmakeup.com/contact",
  },
};

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
