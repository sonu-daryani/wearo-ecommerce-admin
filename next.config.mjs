/** @param {string | undefined} base */
function patternsFromPublicBase(base) {
  const patterns = [];
  if (!base) return patterns;
  try {
    const u = new URL(base);
    if (u.hostname) {
      patterns.push({
        protocol: u.protocol.replace(":", ""),
        hostname: u.hostname,
        pathname: "/**",
      });
    }
  } catch {
    /* ignore */
  }
  return patterns;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.dev", pathname: "/**" },
      ...patternsFromPublicBase(process.env.R2_PUBLIC_BASE_URL),
    ],
  },
};

export default nextConfig;
