import Grid from "@mui/material/Grid2";
import { Metadata } from "next";
import makeupImage from '@/assets/makeup_palette.jpg';
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Box from "@mui/material/Box";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import Image from "next/image";
import Divider from "@mui/material/Divider";

export const metadata: Metadata = {
  title: "For Vendors - Join Our Curated Directory of Wedding Makeup Artists for Asian Brides",
  description: "Specialize in Asian bridal beauty? Join our trusted directory and connect with brides who value your expertise.",
  openGraph: {
    title: "For Vendors — Join Our Curated Directory of Wedding Makeup Artists for Asian Brides",
    description: "Specialize in Asian bridal beauty? Join our trusted directory and connect with brides who value your expertise.",
    url: "https://www.asianweddingmakeup.com/for-vendors",
    type: "website",
    siteName: "Asian Wedding Makeup",
    images: [
      {
        url: makeupImage.src,
        width: 800,
        height: 421,
        alt: "Asian Wedding Makeup Vendor Preview",
      },
    ],
  },
  alternates: {
    canonical: "https://www.asianweddingmakeup.com/for-vendors",
  },
};

const VendorLandingPage = () => {
  const features = [
    {
      icon: <Diversity3Icon sx={{ fontSize: 40 }} />,
      title: 'Reach Your Ideal Clients',
      description: 'Get discovered by Asian brides who are actively looking for experts in Asian beauty.',
    },
    {
      icon: <VisibilityIcon sx={{ fontSize: 40 }} />,
      title: 'Qualified Leads with Free Previews',
      description: 'See every inquiry preview before you decide to connect, so you only pay for brides who are a true fit.',
    },
    {
      icon: <MonetizationOnIcon sx={{ fontSize: 40 }} />,
      title: 'Simple, Transparent Pricing',
      description: 'A free profile is available to every recommended vendor in our directory. Only pay a small fee when you unlock an inquiry — no hidden costs.',
    },
    {
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      title: 'No Bots Guarantee',
      description: 'Every inquiry comes from a real bride. If you unlock a fake inquiry, we\'ll refund your money guaranteed.',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Get Recommended',
      description: 'Get recommended by brides and peers, or simply recommend yourself. We review all submissions for quality and fit.',
    },
    {
      step: '2',
      title: 'We Create Your Profile',
      description: 'If selected, we build a free artist profile to showcase your work in the directory. You are free to update or remove it at any time.',
    },
    {
      step: '3',
      title: 'Brides Discover You',
      description: 'Asian couples seeking your specialized expertise find your profile and submit detailed inquiry forms.',
    },
    {
      step: '4',
      title: 'Review Inquiries and Connect',
      description: 'Each inquiry is complete with details about the bride\'s date, budget, preferences and more. You decide if you want to connect, so you only pay for leads you\'re interested in. We guarantee every inquiry is from a real bride, or we\'ll refund your money.',
    },
  ];

  const faqs = [
    {
      question: 'How much does it cost to get a profile?',
      answer: 'If your business is a good fit, your profile is completely free! We build and maintain your listing at no cost, giving you exposure to our engaged couples.',
    },
    {
      question: 'Can I update my profile information or delete it?',
      answer: 'Absolutely! [Contact us](/contact) anytime to update, edit, or remove your profile. We want your information to stay current and accurate.',
    },
    {
      question: 'Can I recommend myself as an artist to join the directory?',
      answer: 'Yes! We encourage [self-recommendations](/recommend) if you believe your services are a great fit for Asian brides. We review all recommendations to ensure quality and relevance.',
    },
    {
      question: 'Do I need to have Asian heritage to join?',
      answer: 'No! We welcome makeup artists of all backgrounds who are skilled with Asian bridal beauty. What matters most is your abilities. If you are experienced with Asian features, then you are a great fit.',
    },
    {
      question: 'Do you have paid profiles for more features?',
      answer: 'We are testing Premium profiles with additional features like more photos, boosted SEO, and better visibility. If you\'re interested, join our [Premium Waitlist](https://forms.gle/XcYcER3E9SRDr18fA).',
    },
    {
      question: 'How does the pay-per-inquiry system work?',
      answer: 'When a bride fills out an inquiry form for your services, we send you a preview with key details. You can then choose to unlock the full inquiry for a small fee only if it matches your business needs.',
    },
    {
      question: 'Why do you charge a fee for unlocking inquiries?',
      answer: 'The fee allows us to keep the directory free to join, while making sure we can maintain the platform, market it to brides, and connect you only with serious, high-intent inquiries.',
    },
    {
      question: 'How do I know if an inquiry is worth purchasing?',
      answer: 'Our inquiry previews include key details like budget range, event date, and location so you can make an informed decision.',
    }
  ];

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
              <Button
                variant="contained"
                size="large"
                sx={{ py: 1.5, px: 4 }}
                href="/recommend"
              >
                Join for free
              </Button>
              <Button
                variant="outlined"
                size="large"
                href="#how-it-works"
                sx={{ py: 1.5, px: 4 }}
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
                    bgcolor: 'primary.main',
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
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {step.description}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

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
          What our vendors say
        </Typography>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 600,
              minHeight: { xs: 'auto', md: '2.5rem' },
              display: 'flex',
              alignItems: 'center',
              flex: 1
            }}
          >
            &quot;A client found my information on your website, and I&apos;m truly grateful for that!&quot;
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, textAlign: 'right' }}>
            - Jane C Makeup in Boston, MA
          </Typography>
        </Box>
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
        {faqs.map((faq, index) => (
          <Accordion key={index} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" color="text.secondary">
                {faq.answer.split(/(\[.*?\]\(.*?\))/g).map((part, partIndex) => {
                  const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                  if (linkMatch) {
                    const [, linkText, url] = linkMatch;
                    return (
                      <Box
                        key={partIndex}
                        component="a"
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          color: 'primary.main',
                          textDecoration: 'underline',
                          '&:hover': { color: 'primary.dark' }
                        }}
                      >
                        {linkText}
                      </Box>
                    );
                  }
                  return part;
                })}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
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
                  bgcolor: 'white',
                  color: 'primary.main',
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
                  borderColor: 'white',
                  color: 'white',
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
    </Box>
  );
};

export default VendorLandingPage;