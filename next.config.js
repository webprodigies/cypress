/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['fkznyucjlxiuadruvvea.supabase.co'],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
