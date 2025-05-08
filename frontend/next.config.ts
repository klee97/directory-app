import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
// config for analyzing bundle size. Wrap exports in withBundleAnalyzer() to debug
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// });

export default nextConfig;

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};