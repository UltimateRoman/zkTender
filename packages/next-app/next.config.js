/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    WEB3STORAGE_TOKEN: process.env.WEB3STORAGE_TOKEN
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
