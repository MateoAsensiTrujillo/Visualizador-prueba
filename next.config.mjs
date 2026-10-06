/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produce a self-contained server in .next/standalone so the Docker
  // production image only needs that directory + .next/static + public/
  // (no full node_modules copy required).
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
