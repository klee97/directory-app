import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeProvider from '@/components/theme/ThemeProvider';
import Navbar from "@/components/layouts/Navbar";
import FeedbackPopup from "@/features/contact/components/FeedbackPopup";
import Script from "next/script";
import { Footer } from "@/components/layouts/Footer";
import previewImage from '@/assets/website_preview.jpeg';
import { Toaster } from 'react-hot-toast';


export const metadata: Metadata = {
  title: 'Asian Wedding Hair & Makeup – Find artists in NY, LA & more',
  description: 'Find hair and makeup artists recommended for Asian brides. Compare prices, search by location, and book the right artist for you.',
  openGraph: {
    title: 'Vendor Directory - Find the Best Wedding Artists',
    description: 'Find hair and makeup artists recommended for Asian brides. Compare prices, search by location, and book the right artist for you.',
    url: 'https://www.asianweddingmakeup.com/',
    type: 'website',
    images: [
      {
        url: previewImage.src,
        width: 1200,
        height: 630,
        alt: 'Wedding Vendor Directory Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hair and Makeup Wedding Directory for Asian Beauty - Find Artists Experienced with Asian Features',
    description: 'Find hair and makeup artists recommended for Asian brides. Compare prices, search by location, and book the right artist for you.',
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
    <html lang="en">

      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID as string} />
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
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <Navbar />
            {children}
            <Toaster position="top-center" />
            <Footer />
            <FeedbackPopup />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
