/** @type {import('next').NextConfig} */
// Force cache invalidation: 2026-01-29
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
 
}

export default nextConfig
