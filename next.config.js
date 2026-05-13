/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'nominatim.openstreetmap.org' },
      { protocol: 'https', hostname: 'tile.openstreetmap.org' },
    ],
  },
};
module.exports = nextConfig;
