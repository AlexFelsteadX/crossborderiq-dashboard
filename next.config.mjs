/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/hr-intelligence',
        destination: '/workforce-intelligence',
        permanent: true,
      },
      {
        source: '/mobility-maturity-scorecard',
        destination: '/login?mode=signup&next=/premium-dashboard',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
