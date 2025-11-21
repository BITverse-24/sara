/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  // Empty turbopack config to acknowledge we're using Turbopack
  turbopack: {},
};

module.exports = nextConfig;
