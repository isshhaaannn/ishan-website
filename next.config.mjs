/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Media is pre-derived into /public/media by scripts/build-catalog.mjs,
  // so the built-in optimizer is not in the path.
  images: { unoptimized: true },
}

export default nextConfig
