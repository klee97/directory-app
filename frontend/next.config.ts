import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [360, 480, 600, 768, 1024, 1280, 1536, 1920],
    imageSizes: [400, 600],
    qualities: [75, 80, 85, 90],
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 31, // 31 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'xbsnelpjukudknfvmnnj.supabase.co',
        pathname: '/storage/v1/object/public/**'
      },
      {
        protocol: 'https',
        hostname: 'images.asianweddingmakeup.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)', // match all routes
        headers: [
          {
            key: 'X-Frame-Options', // clickjacking protection
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self';",
          },
        ],
      },
    ];
  },
};
// config for analyzing bundle size. Wrap exports in withBundleAnalyzer() to debug
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',

// });
export default nextConfig;