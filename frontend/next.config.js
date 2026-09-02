const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://novique-backend.onrender.com";

// Reasonably strict, but scoped to what this app actually loads: Google
// Analytics + Google Identity Services (Sign-In), the Novique API, and
// self-hosted next/font assets. 'unsafe-inline' is needed for the small
// inline gtag bootstrap script and Tailwind's inline styles.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://accounts.google.com https://apis.google.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${API_URL} https://www.google-analytics.com https://accounts.google.com`,
  "frame-src https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/signals",
        destination: "/intelligence",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
