import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeProvider from '@/components/theme/ThemeProvider';
import { Alice } from 'next/font/google';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NotificationManager } from '@/components/common/NotificationManager';
import { AuthProvider } from "@/contexts/AuthContext";
import { GTMRouteTracker } from "@/contexts/GTMRouteTracker";
import { Suspense } from "react";
import { ConditionalClarity, ConditionalGTM, ConditionalGTMNoScript } from "@/components/analytics/Analytics";
import { DEFAULT_CLARITY_ID, DEFAULT_GTM_ID } from "@/lib/constants";
import { prewarmLocationSlugCache } from "@/lib/location/locationSlugs";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { UserContextTracker } from "@/components/analytics/UserContextTracker";
import type { Organization, WebSite } from 'schema-dts';
import { jsonLdGraph, sanitizeJsonLdHtml } from "@/seo/jsonLdHtml";
import { LOGO_URL, ORG_ID, SITE_URL, WEBSITE_ID, PHOTO_WEBSITE_PREVIEW_URL } from "@/seo/constants";

const alice = Alice({
  weight: ['400'],
  subsets: ['latin'],
  display: 'optional',
  variable: '--font-alice',
  fallback: ['Georgia', 'serif'],
  preload: false, // Disable preloading to avoid render-blocking
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
        url: PHOTO_WEBSITE_PREVIEW_URL,
        alt: 'Asian Wedding Makeup Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Asian Wedding Makeup – Find artists in NYC, LA & more',
    description: 'Find talented wedding makeup artists in NYC, LA, and more. Discover artists experienced with Asian skin tones, monolids, and hair texture.',
    images: [PHOTO_WEBSITE_PREVIEW_URL],
  },
};
const organization: Organization = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "Asian Wedding Makeup",
  url: SITE_URL,
  description: "A curated directory of wedding makeup and hair artists recommended for the Asian diaspora.",
  sameAs: ["https://www.instagram.com/asianweddingmkup"],
  logo: {
    "@type": "ImageObject",
    url: LOGO_URL,
  },
};

const website: WebSite = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: "Asian Wedding Makeup",
  publisher: { "@id": ORG_ID },
};

const globalJsonLd = jsonLdGraph([organization, website]);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  prewarmLocationSlugCache();
  return (
    <html lang="en" className={alice.variable}>
      <head>
        {/* Pinterest site verification */}
        <meta name="p:domain_verify" content="b243038277499f92ffdf12ffbecd514f" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: sanitizeJsonLdHtml(globalJsonLd) }} />
      </head>
      <body>
        <ConditionalGTM gtmId={process.env.NEXT_PUBLIC_GTM_ID || DEFAULT_GTM_ID} />
        <ConditionalClarity clarityId={process.env.NEXT_PUBLIC_CLARITY_ID || DEFAULT_CLARITY_ID} />
        <ConditionalGTMNoScript gtmId={process.env.NEXT_PUBLIC_GTM_ID || DEFAULT_GTM_ID} />
        <AuthProvider>
          <NotificationProvider>
            <NotificationManager />
            <AppRouterCacheProvider>
              <ThemeProvider>
                <Suspense fallback={null}>
                  <GTMRouteTracker />
                  <UserContextTracker />
                </Suspense>
                {children}
                <SpeedInsights />
              </ThemeProvider>
            </AppRouterCacheProvider>
          </NotificationProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}