/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.barcodelookup.com', 'world.openfoodfacts.org'],
  },
}

module.exports = nextConfig
