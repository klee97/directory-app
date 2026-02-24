import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { Metadata } from "next";
import defaultImage from '@/assets/photo_website_preview.jpg';
import FaqList from "@/components/layouts/FaqList";

const faqs = [
  {
    category: "Directory Questions",
    items: [
      {
        question: "One of your listings has inaccurate information!",
        answer: "We're sorry about that! Please [reach out to us](/partner/contact) so we can update it. Our listings are based on vendor websites and social media. While we strive for accuracy, mistakes happen. Let us know, and we'll make it right!"
      },
      {
        question: "Why is the directory focused on Asian brides?",
        answer: "Finding a makeup artist who knows how to work with Asian features is harder than it should be. An artist might be rated five stars online but have no experience with Asian skin tones or eye shapes. We've experienced this firsthand, and built this directory so it's easier to find artists who make you feel your best.",
      },
      {
        question: "Why are most artists listed based in the United States?",
        answer: "We live in the U.S., so that was the easiest information to compile. We hope to expand the directory in the future!",
      },
      {
        question: "I'm looking for an artist who specializes in X.",
        answer: "We are working on adding more information to our listings. Please [reach out to us](/contact) if you are looking for something specific, and we can try to help!",
      },

      {
        question: "Who runs this site?",
        answer: "Katrina and Ivy! We are two Asian-American women who think it's too hard to find vendors for Asian-specific needs."
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
        answer: "It depends on the artist's demand and whether your wedding date is during peak season, but generally 6 to 12 months in advance is recommended. This also gives you time to do a trial session if you want one.",
      },
      {
        question: "Why do some artists charge travel fees?",
        answer: "Travel fees cover transportation costs (fuel, tolls, parking) for artists to reach your wedding and additional time to set up equipment. Not all artists charge travel fees, especially if they are local to your wedding venue. You can also consider going to the artist's studio instead of the artist traveling to you.",
      },
      {
        question: "Do you tip hair and makeup artists for a wedding?",
        answer: "If your HMUA owns their business, tipping isn't required but appreciated. Otherwise, the industry standard is 15-20%. Other ways to show appreciation include writing a positive review, referring friends, and providing a meal if they are staying to do touch-ups.",
      },
      {
        question: "Can I do my own wedding makeup?",
        answer: "Yes! Just remember to test how it photographs, especially with flash, and ensure it lasts throughout the day.",
      },
      {
        question: "What is South Asian bridal makeup?",
        answer: "South Asian bridal makeup often includes bold and dramatic designs. In our directory, you can filter artists who are skilled in South Asian makeup.",
      },
      {
        question: "What is Thai makeup?",
        answer: "Thai makeup is on the rise around the world, especially for Asian bridal makeup. Influenced by both Hollywood glam and Korean beauty, Thai makeup creates a harmonious look that sculpts the face while highlighting Asian eyes and natural features. In our directory, you can filter artists who are skilled in Thai makeup styles. You can also learn more about Thai makeup on our [blog](/blog/what-is-thai-makeup)."
      },
    ],
  },
  {
    category: "Wedding Planning for Asian Brides",
    items: [
      {
        question: "How do I incorporate cultural elements into a Western wedding?",
        answer: "Consider ceremonies, attire, food, decor, and wedding gifts that reflect your culture.",
      },
      {
        question: "How do I find makeup artists who are familiar with Asian features?",
        answer: "Check social media, wedding groups, and our directory for recommendations.",
      },
      {
        question: "Where can I get a hanbok? Where can I get an ao dai?",
        answer: "Check out our [Blog](/blog) for hanbok and ao dai designers based in California.",
      },
      {
        question: "Any other tips for selecting vendors for an Asian wedding?",
        answer: "Ensure photographers understand key moments. Consider using bilingual MCs or check that they can pronounce names correctly!",
      },
    ],
  },
];

export const metadata: Metadata = {
  title: "FAQ - Asian Wedding Makeup in NYC, LA & more",
  description: "Learn more about our asian wedding makeup directory, and find answers to common questions about booking Asian bridal hair and makeup artists.",
  openGraph: {
    title: 'FAQ - Asian Wedding Makeup in NYC, LA & more',
    description: 'Learn more about our asian wedding makeup directory, and find answers to common questions about booking Asian bridal hair and makeup artists.',
    url: 'https://www.asianweddingmakeup.com/faq',
    type: 'website',
    images: [
      {
        url: defaultImage.src,
        width: 800,
        height: 421,
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
      <FaqList faqs={faqs} />  
    </Container>
  );
};

export default FAQPage;
