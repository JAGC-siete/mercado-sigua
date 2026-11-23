/** @type {import('next').NextConfig} */
const path = require('path')

// Las 301 de las rutas viejas (/mercadosanpablosigua, /mercado) viven en middleware.ts,
// junto con el cambio de dominio, para que cada URL vieja llegue en un solo salto.
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  output: 'standalone',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
