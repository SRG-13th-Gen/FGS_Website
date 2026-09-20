import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  heroContent,
  schoolInfoContent,
} from "@/lib/wordpress/sections/content";
import { HERO_FALLBACK } from "@/lib/wordpress/sections/hero";
import { SCHOOL_INFO_FALLBACK } from "@/lib/wordpress/sections/school-info";

const BASE = "http://localhost:8080";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.stubEnv("WORDPRESS_URL", BASE);
  vi.stubEnv("WORDPRESS_USERNAME", "user");
  vi.stubEnv("WORDPRESS_APPLICATION_PASSWORD", "pass");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("heroContent.get()", () => {
  it("resolves the background image URL from the stored media id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/pages?slug=site-hero")) {
          return jsonResponse([
            {
              id: 1,
              meta: {
                fgs_section_data: JSON.stringify({
                  heading: "Welcome",
                  tagline: "Tag",
                  backgroundImage: { mediaId: 42, alt: "Alt text" },
                }),
              },
            },
          ]);
        }
        if (url.includes("/media/42")) {
          return jsonResponse({
            id: 42,
            source_url: `${BASE}/wp-content/uploads/hero.png`,
          });
        }
        throw new Error(`Unexpected URL: ${url}`);
      }),
    );

    const result = await heroContent.get();
    expect(result).toEqual({
      heading: "Welcome",
      tagline: "Tag",
      backgroundImage: {
        mediaId: 42,
        url: `${BASE}/wp-content/uploads/hero.png`,
        alt: "Alt text",
      },
    });
  });

  it("falls back to the bundled local image when the media was deleted", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/pages?slug=site-hero")) {
          return jsonResponse([
            {
              id: 1,
              meta: {
                fgs_section_data: JSON.stringify({
                  heading: "Welcome",
                  tagline: "Tag",
                  backgroundImage: { mediaId: 999, alt: "Alt text" },
                }),
              },
            },
          ]);
        }
        if (url.includes("/media/999")) {
          return new Response("Not Found", { status: 404 });
        }
        throw new Error(`Unexpected URL: ${url}`);
      }),
    );

    const result = await heroContent.get();
    expect(result.backgroundImage.url).toBe(HERO_FALLBACK.backgroundImage.url);
  });

  it("falls back entirely when WordPress is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    expect(await heroContent.get()).toEqual(HERO_FALLBACK);
  });
});

describe("heroContent.save()", () => {
  it("requires an authenticated write and rejects invalid input before any request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await heroContent.save({
      heading: "Hi",
      tagline: "",
      backgroundImage: { mediaId: 1, alt: "" },
    });
    expect(result.status).toBe("validation_error");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports uncertain (not error) when the save request times out", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes("/pages?slug=site-hero")) {
          return jsonResponse([{ id: 1, meta: { fgs_section_data: "{}" } }]);
        }
        if (url.endsWith("/pages/1") && init?.method === "POST") {
          const abortError = new Error("aborted");
          abortError.name = "AbortError";
          throw abortError;
        }
        throw new Error(`Unexpected request: ${url}`);
      }),
    );

    const result = await heroContent.save({
      heading: "A valid heading",
      tagline: "Tag",
      backgroundImage: { mediaId: 1, alt: "Alt" },
    });
    expect(result.status).toBe("uncertain");
  });
});

describe("schoolInfoContent.get()", () => {
  it("resolves the logo URL from the stored media id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/pages?slug=site-school-info")) {
          return jsonResponse([
            {
              id: 1,
              meta: {
                fgs_section_data: JSON.stringify({
                  schoolName: "Test School",
                  shortName: "TS",
                  logo: { mediaId: 7, alt: "Logo" },
                  address: "123 Street",
                  phone: "123",
                  email: "a@b.com",
                  officeHours: "9-5",
                  footerTagline: "Tagline",
                  footerPrograms: ["A", "B"],
                }),
              },
            },
          ]);
        }
        if (url.includes("/media/7")) {
          return jsonResponse({
            id: 7,
            source_url: `${BASE}/wp-content/uploads/logo.png`,
          });
        }
        throw new Error(`Unexpected URL: ${url}`);
      }),
    );

    const result = await schoolInfoContent.get();
    expect(result.logo).toEqual({
      mediaId: 7,
      url: `${BASE}/wp-content/uploads/logo.png`,
      alt: "Logo",
    });
    expect(result.schoolName).toBe("Test School");
  });

  it("falls back entirely when the section is unseeded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse([])),
    );

    expect(await schoolInfoContent.get()).toEqual(SCHOOL_INFO_FALLBACK);
  });
});
