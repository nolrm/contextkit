/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    // Squad, Spec and CI Squad were removed in ContextKit 2.0 — /goal replaces them.
    return [
      { source: '/docs/squad', destination: '/docs/goal', permanent: true },
      { source: '/docs/spec', destination: '/docs/goal', permanent: true },
      { source: '/docs/ci-squad', destination: '/docs/goal', permanent: true },
    ]
  },
}

export default nextConfig
