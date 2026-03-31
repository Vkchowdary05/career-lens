/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // On Vercel, NEXT_PUBLIC_API_URL should be set to your Render backend URL.
    // Locally it falls back to http://127.0.0.1:8000
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
