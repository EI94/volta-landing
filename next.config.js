/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  // Escludi gli endpoint API dalla generazione statica e rendi i React Server Components
  experimental: {
    serverComponentsExternalPackages: ['recharts'],
  }
}

module.exports = nextConfig 