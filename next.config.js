/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for Tauri
  output: 'export',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Ensure proper asset prefix for Tauri
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
}

module.exports = nextConfig