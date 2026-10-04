import { afterEach, describe, expect, it, vi } from "vitest";

import robots from "@/app/robots";

describe("launch indexing switch", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("disallows crawlers on preview and local builds", () => {
    vi.stubEnv("SITE_INDEXABLE", "false");
    expect(robots().rules).toEqual({ userAgent: "*", disallow: "/" });
  });

  it("allows the public site but excludes admin and API routes on live", () => {
    vi.stubEnv("SITE_INDEXABLE", "true");
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
      sitemap: "https://flordegraceschoolinc.com/sitemap.xml",
    });
  });
});
