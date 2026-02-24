"use client";

import Grid from "@mui/material/Grid2";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import Image, { StaticImageData } from "next/image";
import { useAuth } from '@/contexts/AuthContext';
import Divider from "@mui/material/Divider";
import MarkdownContent from "@/components/markdown/MarkdownContent";
import FaqList from "@/components/layouts/FaqList";

interface VendorLandingPageProps {
  makeupImage: StaticImageData;
}

const VendorLandingPage = ({ makeupImage }: VendorLandingPageProps) => {
  const features = [
    {
      icon: <Diversity3Icon sx={{ fontSize: 40 }} />,
      title: "Reach Your Ideal Clients",
      description: "Get discovered by Asian brides who are actively looking for experts in Asian beauty.",
    },
    {
      icon: <VisibilityIcon sx={{ fontSize: 40 }} />,
      title: "Qualified Leads with Free Previews",
      description: "See every inquiry preview before you decide to connect, so you only pay for brides who are a true fit.",
    },
    {
      icon: <MonetizationOnIcon sx={{ fontSize: 40 }} />,
      title: "Simple, Transparent Pricing",
      description: "A free profile is available to every recommended vendor in our directory. Only pay a small fee when you unlock an inquiry — no hidden costs.",
    },
    {
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      title: "Real Response Guarantee",
      description: "Every inquiry comes from a real prospective client. If an inquiry turns out to be a bot or the client doesn't respond, we'll credit your account.",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Get Listed",
      description: "[Get recommended](/recommend) by brides and peers, or simply recommend yourself. We review all submissions for quality and fit. Once you're accepted, we'll create a profile for you using publicly available information.",
    },
    {
      step: "2",
      title: "Claim Your Profile",
      description: "Claim your profile to edit your information and receive bridal inquiries. You may also delete your profile at any time by [contacting us](/partner/contact).",
    },
    {
      step: "3",
      title: "Brides Discover You",
      description: "Asian couples seeking your specialized expertise find your profile and submit detailed inquiry forms.",
    },
    {
      step: "4",
      title: "Review Inquiries and Connect",
      description: "Each inquiry includes details about the couple's date, budget, and preferences. You decide if you want to connect, so you only pay for leads you're interested in. We'll protect you from bots and spammers with our Real Response Guarantee.",
    },
  ];

  const faqs = [
    {
      category: "Getting Listed",
      items: [
        {
          question: "How much does it cost to get a profile?",
          answer: "If your business is a good fit, your profile is completely free! We build you a basic listing at no cost, giving you exposure to our engaged couples.",
        },
        {
          question: "How much does it cost to claim a profile?",
          answer: "Claiming your profile is free!",
        },
        {
          question: "Can I recommend myself as an artist to join the directory?",
          answer: "Yes! We encourage [self-recommendations](/recommend) if you believe your services are a great fit for Asian brides. We review all recommendations to ensure quality and relevance.",
        },
        {
          question: "Do I need to have Asian heritage to be in the directory?",
          answer: "No! We welcome Makeup artists of all backgrounds who are skilled with Asian bridal beauty. What matters most is your abilities. If you are experienced with Asian features, then you are a great fit.",
        },
        {
          question: "Do you support other types of wedding vendors besides Makeup artists?",
          answer: "For now, we are focused on hair and Makeup artists. We have resources about other wedding vendors and topics in our [Blog](/blog).",
        },
      ],
    },
    {
      category: "Managing Your Profile",
      items: [
        {
          question: "Can I update my profile information?",
          answer: "Absolutely! Claim your profile to directly edit your business information through our Vendor Portal.",
        },
        {
          question: "How do I remove my profile from the directory?",
          answer: "If you don't want to be listed, please [contact us](/partner/contact) and we'll remove your profile",
        },
        {
          question: "Do you have paid profiles for more features?",
          answer: "We are testing Premium profiles with additional features like more photos, boosted SEO, and better visibility. If you're interested, join our [Premium Waitlist](https://forms.gle/XcYcER3E9SRDr18fA).",
        },
      ],
    },
    {
      category: "Inquiries",
      items: [
        {
          question: "How do I start receiving inquiries?",
          answer: "Claim your profile to start receiving inquiries. We'll protect you from bots and spammers with our Real Response Guarantee.",
        },
        {
          question: "How does the pay-per-inquiry system work?",
          answer: "When a bride fills out an inquiry form for your services, we send you a preview with key details. You can then choose to unlock the full inquiry for a small fee only if it matches your business needs.",
        },
        {
          question: "Why do you charge a fee for unlocking inquiries?",
          answer: "The fee allows us to keep the directory free to join, while making sure we can maintain the platform, market it to brides, and connect you only with serious, high-intent inquiries.",
        },
        {
          question: "How do I know if an inquiry is worth purchasing?",
          answer: "Our inquiry previews include key details like budget range, event date, and location so you can make an informed decision.",
        },
      ],
    },
  ];

  const { isLoggedIn, isVendor } = useAuth();

  return (
    <Box>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                mb: 3,
              }}
            >
              Do you specialize in Asian Wedding Makeup?
            </Typography>
            <Typography
              variant="h3"
              sx={{
                mb: 2,
                fontWeight: 400,
              }}
            >
              Brides are looking for you!
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                fontWeight: 400,
              }}
            >
              Join our curated directory of makeup artists trusted by the Asian community.
              Enjoy a free business profile, and get discovered by Asian brides who are specifically looking for artists experienced with Asian features.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {isLoggedIn && isVendor ? (
                <Button
                  variant="contained"
                  size="large"
                  sx={{ py: 1.5, px: 4 }}
                  href="partner/dashboard"
                  color="info"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  sx={{ py: 1.5, px: 4 }}
                  href="/recommend"
                  color="info"
                >
                  Join for free
                </Button>
              )
              }
              <Button
                variant="outlined"
                size="large"
                href="#how-it-works"
                sx={{ py: 1.5, px: 4 }}
                color="inherit"
              >
                How it works
              </Button>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 2, overflow: "hidden", display: "inline-block", boxShadow: "none" }}>
              <Image
                src={makeupImage}
                alt="Professional makeup palette"
                style={{ display: "block", width: "100%", height: "auto" }}
              />
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Divider />

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            align="center"
            sx={{ mb: 6, fontSize: { xs: '2rem', md: '2.5rem' } }}
          >
            What We Offer
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 3 }} key={index}>
                <Card sx={{ bgcolor: 'info.light', height: '100%', p: 1 }}>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Divider />
      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          component="h2"
          align="center"
          id="how-it-works"
          sx={{ mb: 6, fontSize: { xs: '2rem', md: '2.5rem' } }}
        >
          What Our Vendors Say
        </Typography>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 500,
              minHeight: { xs: 'auto', md: '2.5rem' },
              display: 'flex',
              alignItems: 'center',
              flex: 1
            }}
          >
            &quot;A client found my information through the directory, and I&apos;m truly grateful for that!&quot;
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, textAlign: 'right' }}>
            - Jane C. in Boston, MA
          </Typography>
        </Box>
        <br /><br />
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 500,
              minHeight: { xs: 'auto', md: '2.5rem' },
              display: 'flex',
              alignItems: 'center',
              flex: 1
            }}
          >
            &quot;I connected with a bride through Asian Wedding Makeup. We had a very good experience during the trial, and she booked me for her wedding! I really appreciate all your help and hope we&apos;ll have more chances to work together in the future.&quot;
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, textAlign: 'right' }}>
            - Coco L. in New York City, NY
          </Typography>
        </Box>
      </Container>
      <Divider />
      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          component="h2"
          align="center"
          id="how-it-works"
          sx={{ mb: 6, fontSize: { xs: '2rem', md: '2.5rem' } }}
        >
          How It Works
        </Typography>
        <Grid container spacing={4}>
          {howItWorks.map((step, index) => (
            <Grid size={{ xs: 12 }} key={index}>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    minWidth: 50,
                    height: 50,
                    borderRadius: '8px',
                    bgcolor: 'secondary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    flexShrink: 0,
                  }}
                >
                  {step.step}
                </Box>
                <Box sx={{ flex: 1 }}>

                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      minHeight: { xs: 'auto', md: '2.5rem' },
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {step.title}
                  </Typography>
                  <MarkdownContent content={step.description} />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider />

      {/* FAQ Section */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          component="h2"
          align="center"
          sx={{ mb: 6, fontSize: { xs: '2rem', md: '2.5rem' } }}
        >
          Frequently Asked Questions
        </Typography>
        <FaqList faqs={faqs} />
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'secondary.main', py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{ mb: 3, fontSize: { xs: '2rem', md: '2.5rem' } }}
            >
              Ready to connect with more Asian brides?
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 400 }}>
              Join our directory of trusted makeup artists today.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  py: 1.5,
                  px: 4,
                  bgcolor: 'background.light',
                  color: 'info.main',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
                href="/recommend"
              >
                Get Your Free Profile
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  py: 1.5,
                  px: 4,
                  borderColor: 'background.light',
                  color: 'background.light',
                  '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255,255,255,0.1)' },
                }}
                href="/contact"
                startIcon={<EmailIcon />}
              >
                Contact Us
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box >
  );
};


export default VendorLandingPage;