import { Container, Typography } from "@mui/material";
import { EmailForm } from "@/features/contact/components/EmailForm";
import { Metadata } from "next";
import defaultImage from '@/assets/website_preview.jpeg';

export const metadata: Metadata = {
  title: "Contact Us - Asian Wedding Makeup in NYC, LA & more",
  description: "Need help finding a wedding artist? Want to recommend a makeup artist, or update a listing? Get in touch with us.",
  openGraph: {
    title: 'Contact Us - Asian Wedding Makeup in NYC, LA & more',
    description: 'Need help finding a wedding artist? Want to recommend a makeup artist, or update a listing? Get in touch with us.',
    url: 'https://www.asianweddingmakeup.com/contact',
    type: 'website',
    images: [
      {
        url: defaultImage.src,
        width: 1200,
        height: 630,
        alt: 'Asian Wedding Makeup Preview',
      },
    ],
  },
  alternates: {
    canonical: "https://www.asianweddingmakeup.com/contact",
  },
};

export default function ContactUs() {
  return (
    <Container maxWidth="sm">
      <br />
      <Typography variant="h1" gutterBottom sx={{ mt: 2 }}>
        Contact Us
      </Typography>
      <Typography variant="body1" gutterBottom>
        Have questions? Want to recommend a vendor or update a listing? Fill out the form below.
      </Typography>
      <EmailForm />
    </Container>
  );
}
