/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    level: "info",
    format: "json",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.intra.42.fr",
        port: "",
        pathname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
