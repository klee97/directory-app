import type { Metadata } from "next";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react"
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeProvider from '@/components/theme/ThemeProvider';
import Navbar from "@/components/layouts/Navbar";
import FeedbackPopup from "@/features/contact/components/FeedbackPopup";
import Script from "next/script";
import { Footer } from "@/components/layouts/Footer";
import previewImage from '@/assets/website_preview.jpeg';
import { Lato } from 'next/font/google';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NotificationManager } from '@/components/common/NotificationManager';
import { AuthProvider } from "@/contexts/AuthContext";
import FeatureCTABanner from "@/components/ui/FeatureCTABanner";

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
        <GoogleTagManager gtmId="GTM-5SVLZR2M" />
        {/* Microsoft Clarity */}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "qcfdyqnpxk");`,
          }}
        />
      </head>
      <body>
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5SVLZR2M"
          height="0" width="0" style={{ display: "none", visibility: "hidden" }}></iframe></noscript>
        <AuthProvider>
          <NotificationProvider>
            <NotificationManager />
            <AppRouterCacheProvider>
              <ThemeProvider>
                <FeatureCTABanner actionUrl="/signup" />
                <Navbar />
                {children}
                <Footer />
                <FeedbackPopup />
              </ThemeProvider>
            </AppRouterCacheProvider>
          </NotificationProvider>
        </AuthProvider>
        <Analytics />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID as string} />
    </html>
  );
}
