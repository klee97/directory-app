import React from "react";
import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, Link } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Metadata } from "next";
import defaultImage from '@/assets/website_preview.jpeg';

const faqs = [
  {
    category: "Directory Questions",
    items: [
      {
        question: "One of your listings has inaccurate information!",
        answer: (
          <>
            We’re sorry about that! Please <Link href="/contact">reach out to us</Link> so we can update it. Our listings are based on vendor websites and social media. While we strive for accuracy, mistakes happen. Let us know, and we’ll make it right!
          </>
        ),
      },
      {
        question: "Why is the directory focused on Asian brides?",
        answer:
          "Finding vendors experienced with Asian-specific needs can be challenging. It’s about representation and expertise, such as makeup for different skin tones and hairstyling for various textures. That said, our directory is open to anyone!",
      },
      {
        question: "Why are most artists listed based in the United States?",
        answer: "We live in the U.S., so that was the easiest information to compile. We hope to expand the directory in the future!",
      },
      {
        question: "Who runs this site?",
        answer: (
          <>
            Katrina and Ivy! We are two Asian-American women who think it’s too hard to find vendors for Asian-specific needs.
          </>
        ),
      },
    ],
  },
  {
    category: "General Questions",
    items: [
      {
        question: "What does MUA and HMUA stand for?",
        answer: "MUA means Makeup Artist. HMUA is a Hair and Makeup Artist.",
      },
      {
        question: "When should I book hair and makeup for my wedding?",
        answer: "It depends on demand, but generally 6 months in advance is recommended.",
      },
      {
        question: "Do you tip hair and makeup artists for a wedding?",
        answer: "If your HMUA owns their business, tipping isn’t required but appreciated. Otherwise, industry standard is 15-20%.",
      },
      {
        question: "Can I do my own wedding makeup?",
        answer: "Yes! Just remember to test how it photographs and ensure it lasts throughout the day.",
      },
    ],
  },
  {
    category: "Wedding Planning for Asian Brides",
    items: [
      {
        question: "How do I incorporate cultural elements into a Western wedding?",
        answer: "Consider ceremonies, attire, food, and decor that reflect your culture.",
      },
      {
        question: "How do I find makeup artists who are familiar with Asian features?",
        answer: "Check social media, wedding groups, and our directory for recommendations.",
      },
      {
        question: "Any other tips for selecting vendors for an Asian wedding?",
        answer: "Ensure photographers understand key moments, and check that DJs can pronounce names correctly!",
      },
    ],
  },
];

export const metadata: Metadata = {
  title: "FAQ - Asian Wedding Hair & Makeup in NYC, LA & more",
  description: "Learn more about our wedding directory, and find answers to common questions about booking Asian bridal hair and makeup artists.",
  openGraph: {
    title: 'FAQ - Asian Wedding Hair & Makeup in NYC, LA & more',
    description: 'Learn more about our wedding directory, and find answers to common questions about booking Asian bridal hair and makeup artists.',
    url: 'https://www.asianweddingmakeup.com/faq',
    type: 'website',
    images: [
      {
        url: defaultImage.src,
        width: 1200,
        height: 630,
        alt: 'Wedding Vendor Directory Preview',
      },
    ],
  },
  alternates: {
    canonical: "https://www.asianweddingmakeup.com/faq",
  },
};

const FAQPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <br />
      <Typography variant="h1" gutterBottom>
        Frequently Asked Questions
      </Typography>
      {faqs.map((section, index) => (
        <div key={index}>
          <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
            {section.category}
          </Typography>
          {section.items.map((faq, i) => (
            <Accordion key={i}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      ))}
    </Container>
  );
};

export default FAQPage;
