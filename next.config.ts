import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Config options */
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Enable experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react'],
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Environment variable validation
  // This ensures required env vars are present at build time
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  },
};

export default nextConfig;
