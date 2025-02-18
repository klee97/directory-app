import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeProvider from '@/components/theme/ThemeProvider';
import Navbar from "@/components/layouts/Navbar";
import FeedbackPopup from "@/features/contact/components/FeedbackPopup";

export const metadata: Metadata = {
  title: 'Hair and Makeup Wedding Directory for Asian Beauty - Find Artists Experienced with Asian Features',
  description: 'Find hair and makeup artists recommended for Asian brides. Compare prices, search by location, and book the right artist for you.',
  openGraph: {
    title: 'Vendor Directory - Find the Best Wedding Artists',
    description: 'Find hair and makeup artists recommended for Asian brides. Compare prices, search by location, and book the right artist for you.',
    url: 'https://www.asianweddingmakeup.com/',
    type: 'website',
    // images: [
    //   {
    //     url: 'https://yourwebsite.com/preview-image.jpg',
    //     width: 1200,
    //     height: 630,
    //     alt: 'Wedding Vendor Directory Preview',
    //   },
    // ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hair and Makeup Wedding Directory for Asian Beauty - Find Artists Experienced with Asian Features',
    description: 'Find hair and makeup artists recommended for Asian brides. Compare prices, search by location, and book the right artist for you.',
    // images: ['https://yourwebsite.com/preview-image.jpg'],
  },
  alternates: {
    canonical: 'https://asianweddingmakeup.com/',
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID as string} />
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <Navbar />
            {children}
            <FeedbackPopup />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
