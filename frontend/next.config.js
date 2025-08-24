/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'de', 'ar'],
    defaultLocale: 'en',
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
