/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable x-powered-by header
  poweredByHeader: false,

  // No image optimization needed — we show NO images
  images: { unoptimized: true },

  // Compress responses
  compress: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, stale-while-revalidate=600" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
