/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  experimental: {
    useTypeScriptCli: true,
  },
  turbopack: {
    root: __dirname,
  },
  // Next's built-in typecheck worker currently crashes on this environment
  // ("The \"id\" argument must be of type string. Received undefined").
  // Type errors are still caught via `npm run type-check` (tsc --noEmit).
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
