/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NEXT_DIST_DIR
    ? { distDir: process.env.NEXT_DIST_DIR }
    : {}),
  ...(process.env.NEXT_DEV_TSCONFIG
    ? { typescript: { tsconfigPath: process.env.NEXT_DEV_TSCONFIG } }
    : {}),
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];

    const instagramPort = Number(process.env.INSTAGRAM_SERVICE_PORT || 8791);

    return [
      {
        source: "/api/scraping/instagram/:path*",
        destination: `http://127.0.0.1:${instagramPort}/api/scraping/instagram/:path*`,
      },
    ];
  },
};

export default nextConfig;
