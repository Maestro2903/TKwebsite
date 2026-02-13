import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Strict Mode – React 19 double-mounts break WebGL contexts
  // (R3F Canvas creates a GL context on mount, strict-mode teardown invalidates it,
  //  remount gets the same dead context → "Context Lost")
  reactStrictMode: false,
  experimental: {
    serverComponentsHmrCache: false,
  },
  turbopack: {},
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
  },
  // Enable compression
  compress: true,
  // Remove X-Powered-By header
  poweredByHeader: false,
  // Webpack optimizations
  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxSize: 200000, // 200KB max chunk size for better caching
        },
      };
    }
    return config;
  },
};

export default nextConfig;
