/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: '/mercado', destination: '/mercadosanpablosigua', permanent: true },
      {
        source: '/mercado/:path((?!.*\\.).*)',
        destination: '/mercadosanpablosigua/:path',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
