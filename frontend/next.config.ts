import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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