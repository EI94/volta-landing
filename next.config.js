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
  // Configurazione per l'API e il rendering serverless
  experimental: {
    serverActions: true,
    // Gestione di recharts come pacchetto esterno
    serverComponentsExternalPackages: ['recharts']
  }
}

module.exports = nextConfig 