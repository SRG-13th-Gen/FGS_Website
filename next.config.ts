import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  // Resolve missing news before sending a streamed 200 response.
  htmlLimitedBots: /.*/,
  poweredByHeader: false,
  images: { qualities: [75, 85, 90] },
  experimental: { serverActions: { bodySizeLimit: "65mb" } },
};
export default nextConfig;
