/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nextuipro.nyc3.cdn.digitaloceanspaces.com',
      },
    ],
  },
  eslint: {
    // NOTE: This allows production builds to successfully complete
    // even if your project has ESLint errors.
    // ignoreDuringBuilds: true,
    
  },
}

module.exports = nextConfig
