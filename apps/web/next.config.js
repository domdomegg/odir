/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  distDir: 'dist',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  pageExtensions: ['tsx'],
  trailingSlash: true,
  transpilePackages: ['@odir/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: false,
};
