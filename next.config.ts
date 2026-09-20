import type { NextConfig } from "next";

// Derived from WORDPRESS_URL, not a wildcard — see docs/DATA_API_CONTRACTS.md.
const wordpressUrl = new URL(
  process.env.WORDPRESS_URL || "http://localhost:8080",
);
const isLoopbackHost = ["localhost", "127.0.0.1", "::1"].includes(
  wordpressUrl.hostname,
);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: wordpressUrl.protocol.replace(":", "") as "http" | "https",
        hostname: wordpressUrl.hostname,
        port: wordpressUrl.port,
        pathname: "/wp-content/uploads/**",
      },
    ],
    // Local WordPress runs on loopback; the image optimizer otherwise refuses
    // local IPs as an SSRF guard. Never true for a non-loopback WORDPRESS_URL.
    dangerouslyAllowLocalIP: isLoopbackHost,
  },
  experimental: {
    serverActions: {
      // Up to MAX_IMAGES_PER_ARTICLE (6) x 10 MB images, plus multipart overhead.
      bodySizeLimit: "65mb",
    },
  },
};

export default nextConfig;
