import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeProvider from '@/components/theme/ThemeProvider';
import Navbar from "@/components/layouts/Navbar";
import FeedbackPopup from "@/features/contact/components/FeedbackPopup";
import { Footer } from "@/components/layouts/Footer";
import previewImage from '@/assets/photo_website_preview.jpg';
import { Alice } from 'next/font/google';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NotificationManager } from '@/components/common/NotificationManager';
import { AuthProvider } from "@/contexts/AuthContext";
import FeatureCTABanner from "@/components/ui/FeatureCTABanner";
import { GTMRouteTracker } from "@/contexts/GTMRouteTracker";
import { Suspense } from "react";
import { ConditionalClarity, ConditionalGA, ConditionalGTM, ConditionalGTMNoScript } from "@/components/analytics/Analytics";
import { DEFAULT_CLARITY_ID, DEFAULT_GA_ID, DEFAULT_GTM_ID } from "@/lib/constants";
import { prewarmLocationSlugCache } from "@/lib/location/locationSlugs";
import { SpeedInsights } from "@vercel/speed-insights/next"

const alice = Alice({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.asianweddingmakeup.com'),
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
        width: 800,
        height: 421,
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
  prewarmLocationSlugCache();
  return (
    <html lang="en" className={alice.className}>
      <head>
        <ConditionalGTM gtmId={process.env.NEXT_PUBLIC_GTM_ID || DEFAULT_GTM_ID} />
        <ConditionalClarity clarityId={process.env.NEXT_PUBLIC_CLARITY_ID || DEFAULT_CLARITY_ID} />
        {/* Pinterest site verification */}
        <meta name="p:domain_verify" content="b243038277499f92ffdf12ffbecd514f" />
      </head>
      <body>
        <ConditionalGTMNoScript gtmId={process.env.NEXT_PUBLIC_GTM_ID || DEFAULT_GTM_ID} />
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
                <SpeedInsights />
                <Footer />
                <FeedbackPopup />
              </ThemeProvider>
            </AppRouterCacheProvider>
          </NotificationProvider>
        </AuthProvider>
        <Analytics />
      </body>
      <ConditionalGA gaId={process.env.NEXT_PUBLIC_GA_ID || DEFAULT_GA_ID} />
    </html>
  );
}
