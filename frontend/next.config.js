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
};

module.exports = nextConfig;
