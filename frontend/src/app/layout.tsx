import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeProvider from '@/components/theme/ThemeProvider';
import Navbar from "@/components/layouts/Navbar";
import FeedbackPopup from "@/features/contact/components/FeedbackPopup";
import { Footer } from "@/components/layouts/Footer";
import previewImage from '@/assets/website_preview.jpeg';
import { Lato } from 'next/font/google';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NotificationManager } from '@/components/common/NotificationManager';
import { AuthProvider } from "@/contexts/AuthContext";
import FeatureCTABanner from "@/components/ui/FeatureCTABanner";
import { GTMRouteTracker } from "@/contexts/GTMRouteTracker";
import { Suspense } from "react";
import { ConditionalClarity, ConditionalGA, ConditionalGTM, ConditionalGTMNoScript } from "@/components/analytics/Analytics";

const lato = Lato({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Asian Wedding Makeup – Find artists in NYC, LA & more',
  description: 'Find talented wedding makeup artists in NYC, LA, and more. Discover artists experienced with Asian skin tones, monolids, and hair texture.',
  openGraph: {
    title: 'Asian Wedding Makeup - Find artists in NYC, LA & more',
    description: 'Find talented wedding makeup artists in NYC, LA, and more. Discover artists experienced with Asian skin tones, monolids, and hair texture.',
    url: 'https://www.asianweddingmakeup.com/',
    type: 'website',
    images: [
      {
        url: previewImage.src,
        width: 1200,
        height: 630,
        alt: 'Asian Wedding Makeup Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Asian Wedding Makeup – Find artists in NYC, LA & more',
    description: 'Find talented wedding makeup artists in NYC, LA, and more. Discover artists experienced with Asian skin tones, monolids, and hair texture.',
    images: [previewImage.src],
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
    <html lang="en" className={lato.className}>
      <head>
        <ConditionalGTM gtmId={process.env.NEXT_PUBLIC_GTM_ID || "GTM-5SVLZR2M"} />
        <ConditionalClarity clarityId={process.env.NEXT_PUBLIC_CLARITY_ID || "qcfdyqnpxk"} />
      </head>
      <body>
        <ConditionalGTMNoScript gtmId={process.env.NEXT_PUBLIC_GTM_ID || "GTM-5SVLZR2M"} />
        <AuthProvider>
          <NotificationProvider>
            <NotificationManager />
            <AppRouterCacheProvider>
              <ThemeProvider>
                <FeatureCTABanner actionUrl="/signup" />
                <Navbar />
                <Suspense fallback={null}>
                  <GTMRouteTracker />
                </Suspense>
                {children}
                <Footer />
                <FeedbackPopup />
              </ThemeProvider>
            </AppRouterCacheProvider>
          </NotificationProvider>
        </AuthProvider>
        <Analytics />
      </body>
      <ConditionalGA gaId={process.env.NEXT_PUBLIC_GA_ID || "G-7JZKX3Q1F4"} />
    </html>
  );
}
