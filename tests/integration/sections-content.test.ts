import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  aboutContent,
  admissionContent,
  clubsContent,
  contactContent,
  galleryContent,
  heroContent,
  schoolInfoContent,
} from "@/lib/wordpress/sections/content";
import { ABOUT_DEFAULTS, ABOUT_FALLBACK } from "@/lib/wordpress/sections/about";
import {
  ADMISSION_DEFAULTS,
  ADMISSION_FALLBACK,
} from "@/lib/wordpress/sections/admission";
import { CLUBS_DEFAULTS } from "@/lib/wordpress/sections/clubs";
import { CONTACT_DEFAULTS } from "@/lib/wordpress/sections/contact";
import {
  GALLERY_DEFAULTS,
  GALLERY_FALLBACK,
} from "@/lib/wordpress/sections/gallery";
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

describe("aboutContent.get()", () => {
  it("resolves the feature banner image URL from the stored media id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/pages?slug=site-about")) {
          return jsonResponse([
            {
              id: 2,
              meta: {
                fgs_section_data: JSON.stringify({
                  ...ABOUT_DEFAULTS,
                  featureBanner: {
                    ...ABOUT_DEFAULTS.featureBanner,
                    image: { mediaId: 14, alt: "Classroom" },
                  },
                }),
              },
            },
          ]);
        }
        if (url.includes("/media/14")) {
          return jsonResponse({
            id: 14,
            source_url: `${BASE}/wp-content/uploads/classroom.webp`,
          });
        }
        throw new Error(`Unexpected URL: ${url}`);
      }),
    );

    const result = await aboutContent.get();
    expect(result.featureBanner.image).toEqual({
      mediaId: 14,
      url: `${BASE}/wp-content/uploads/classroom.webp`,
      alt: "Classroom",
    });
    expect(result.quote).toEqual(ABOUT_DEFAULTS.quote);
  });

  it("falls back entirely when the section is unseeded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse([])),
    );

    expect(await aboutContent.get()).toEqual(ABOUT_FALLBACK);
  });
});

describe("aboutContent.save()", () => {
  it("rejects invalid input before any request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await aboutContent.save({
      ...ABOUT_DEFAULTS,
      storyParagraphs: [],
    });
    expect(result.status).toBe("validation_error");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("admissionContent.get()", () => {
  it("resolves the background image URL from the stored media id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/pages?slug=site-admission")) {
          return jsonResponse([
            {
              id: 3,
              meta: {
                fgs_section_data: JSON.stringify({
                  ...ADMISSION_DEFAULTS,
                  backgroundImage: { mediaId: 13, alt: "Admission" },
                }),
              },
            },
          ]);
        }
        if (url.includes("/media/13")) {
          return jsonResponse({
            id: 13,
            source_url: `${BASE}/wp-content/uploads/admission.webp`,
          });
        }
        throw new Error(`Unexpected URL: ${url}`);
      }),
    );

    const result = await admissionContent.get();
    expect(result.backgroundImage).toEqual({
      mediaId: 13,
      url: `${BASE}/wp-content/uploads/admission.webp`,
      alt: "Admission",
    });
  });

  it("falls back entirely when WordPress is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    expect(await admissionContent.get()).toEqual(ADMISSION_FALLBACK);
  });
});

describe("admissionContent.save()", () => {
  it("rejects an unknown icon before any request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await admissionContent.save({
      ...ADMISSION_DEFAULTS,
      programs: [
        { ...ADMISSION_DEFAULTS.programs[0], icon: "not-real" as never },
      ],
    });
    expect(result.status).toBe("validation_error");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("contactContent (generic adapter)", () => {
  it("get() returns the defaults when the section is unseeded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse([])),
    );
    expect(await contactContent.get()).toEqual(CONTACT_DEFAULTS);
  });

  it("save() rejects an empty card list before any request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await contactContent.save({
      ...CONTACT_DEFAULTS,
      cards: [],
    });
    expect(result.status).toBe("validation_error");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("save() writes the validated JSON to the section page", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes("/pages?slug=site-contact")) {
          return jsonResponse([{ id: 4, meta: { fgs_section_data: "{}" } }]);
        }
        if (url.endsWith("/pages/4") && init?.method === "POST") {
          const body = JSON.parse(String(init.body));
          expect(JSON.parse(body.meta.fgs_section_data)).toEqual(
            CONTACT_DEFAULTS,
          );
          return jsonResponse({ id: 4 });
        }
        throw new Error(`Unexpected request: ${url}`);
      }),
    );

    const result = await contactContent.save(CONTACT_DEFAULTS);
    expect(result.status).toBe("success");
  });
});

describe("clubsContent (generic adapter)", () => {
  it("get() returns the defaults when the section is unseeded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse([])),
    );
    expect(await clubsContent.get()).toEqual(CLUBS_DEFAULTS);
  });

  it("save() rejects an empty club list before any request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await clubsContent.save({ ...CLUBS_DEFAULTS, clubs: [] });
    expect(result.status).toBe("validation_error");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("galleryContent.get()", () => {
  it("resolves each photo's image URL and drops photos whose media was deleted", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/pages?slug=site-gallery")) {
          return jsonResponse([
            {
              id: 6,
              meta: {
                fgs_section_data: JSON.stringify({
                  ...GALLERY_DEFAULTS,
                  photos: [
                    {
                      image: { mediaId: 20, alt: "Field day" },
                      caption: "Field day",
                    },
                    {
                      image: { mediaId: 999, alt: "Deleted" },
                      caption: "Gone",
                    },
                  ],
                }),
              },
            },
          ]);
        }
        if (url.includes("/media/20")) {
          return jsonResponse({
            id: 20,
            source_url: `${BASE}/wp-content/uploads/field-day.jpg`,
          });
        }
        if (url.includes("/media/999")) {
          return new Response("Not Found", { status: 404 });
        }
        throw new Error(`Unexpected URL: ${url}`);
      }),
    );

    const result = await galleryContent.get();
    expect(result.photos).toHaveLength(1);
    expect(result.photos[0]).toEqual({
      image: {
        mediaId: 20,
        url: `${BASE}/wp-content/uploads/field-day.jpg`,
        alt: "Field day",
      },
      caption: "Field day",
    });
  });

  it("falls back to an empty gallery when the section is unseeded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse([])),
    );

    expect(await galleryContent.get()).toEqual(GALLERY_FALLBACK);
  });
});

describe("galleryContent.save()", () => {
  it("allows an empty photo list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes("/pages?slug=site-gallery")) {
          return jsonResponse([{ id: 6, meta: { fgs_section_data: "{}" } }]);
        }
        if (url.endsWith("/pages/6") && init?.method === "POST") {
          return jsonResponse({ id: 6 });
        }
        throw new Error(`Unexpected request: ${url}`);
      }),
    );

    const result = await galleryContent.save(GALLERY_DEFAULTS);
    expect(result.status).toBe("success");
  });

  it("rejects a photo caption over 150 characters before any request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await galleryContent.save({
      ...GALLERY_DEFAULTS,
      photos: [{ image: { mediaId: 1, alt: "x" }, caption: "x".repeat(151) }],
    });
    expect(result.status).toBe("validation_error");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
