import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  // Resolve missing news before sending a streamed 200 response.
  htmlLimitedBots: /.*/,
  poweredByHeader: false,
  images: { qualities: [75, 85, 90] },
  // The Alumni and PTA activity lists are now category filters of All Posts.
  async redirects() {
    return [
      {
        source: "/admin/alumni/activities",
        destination: "/admin/articles?category=alumni",
        permanent: false,
      },
      {
        source: "/admin/pta/activities",
        destination: "/admin/articles?category=pta",
        permanent: false,
      },
    ];
  },
  experimental: { serverActions: { bodySizeLimit: "65mb" } },
};
export default nextConfig;
