import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: vi.fn(async () => ({ email: "admin@fgs.local" })),
}));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}));

const { saveHeroAction } =
  await import("@/app/admin/(protected)/sections/hero/actions");
const { saveAboutAction } =
  await import("@/app/admin/(protected)/sections/about/actions");
const { saveAdmissionAction } =
  await import("@/app/admin/(protected)/sections/admission/actions");
const { saveContactAction } =
  await import("@/app/admin/(protected)/sections/contact/actions");
const { saveClubsAction } =
  await import("@/app/admin/(protected)/sections/clubs/actions");
const { saveGalleryAction } =
  await import("@/app/admin/(protected)/sections/gallery/actions");
const { requireAdmin } = await import("@/lib/auth/require-admin");
const { ABOUT_DEFAULTS } = await import("@/lib/wordpress/sections/about");
const { ADMISSION_DEFAULTS } =
  await import("@/lib/wordpress/sections/admission");
const { CONTACT_DEFAULTS } = await import("@/lib/wordpress/sections/contact");
const { CLUBS_DEFAULTS } = await import("@/lib/wordpress/sections/clubs");
const { GALLERY_DEFAULTS } = await import("@/lib/wordpress/sections/gallery");

const BASE = "http://localhost:8080";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function buildFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set("heading", "A valid heading");
  formData.set("tagline", "A valid tagline");
  formData.set("backgroundImageMediaId", "5");
  formData.set("backgroundImageAlt", "Existing alt text");
  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }
  return formData;
}

beforeEach(() => {
  vi.stubEnv("WORDPRESS_URL", BASE);
  vi.stubEnv("WORDPRESS_USERNAME", "user");
  vi.stubEnv("WORDPRESS_APPLICATION_PASSWORD", "pass");
  revalidatePathMock.mockReset();
  vi.mocked(requireAdmin).mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function stubWordpressSave() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes("/pages?slug=site-hero")) {
        return jsonResponse([{ id: 1, meta: { fgs_section_data: "{}" } }]);
      }
      if (url.endsWith("/pages/1") && init?.method === "POST") {
        return jsonResponse({ id: 1 });
      }
      throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${url}`);
    }),
  );
}

describe("saveHeroAction", () => {
  it("requires admin before doing anything else", async () => {
    stubWordpressSave();
    await saveHeroAction(null, buildFormData());
    expect(requireAdmin).toHaveBeenCalled();
  });

  it("saves with the existing media id when no new file is selected", async () => {
    stubWordpressSave();
    const result = await saveHeroAction(null, buildFormData());
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.cacheWarning).toBe(false);
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
  });

  it("reports a cache warning (not a failure) when revalidation throws after a successful save", async () => {
    revalidatePathMock.mockImplementation(() => {
      throw new Error("cache backend unavailable");
    });
    stubWordpressSave();

    const result = await saveHeroAction(null, buildFormData());
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.cacheWarning).toBe(true);
  });

  it("uploads a new image and uses its media id when a file is provided", async () => {
    const requests: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        requests.push(`${init?.method ?? "GET"} ${url}`);
        if (url.includes("/pages?slug=site-hero")) {
          return jsonResponse([{ id: 1, meta: { fgs_section_data: "{}" } }]);
        }
        if (url.endsWith("/media") && init?.method === "POST") {
          return jsonResponse({
            id: 99,
            source_url: `${BASE}/wp-content/uploads/new.jpg`,
          });
        }
        if (url.endsWith("/pages/1") && init?.method === "POST") {
          const body = JSON.parse(String(init.body));
          expect(body.meta.fgs_section_data).toContain('"mediaId":99');
          return jsonResponse({ id: 1 });
        }
        throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${url}`);
      }),
    );

    const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
    const file = new File([jpegHeader], "new.jpg");
    const formData = buildFormData();
    formData.set("backgroundImageFile", file);

    const result = await saveHeroAction(null, formData);
    expect(result.status).toBe("success");
    expect(
      requests.some((r) => r.includes("/media") && r.startsWith("POST")),
    ).toBe(true);
  });
});

function stubWordpressSaveFor(slug: string, pageId: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes(`/pages?slug=${slug}`)) {
        return jsonResponse([{ id: pageId, meta: { fgs_section_data: "{}" } }]);
      }
      if (url.endsWith(`/pages/${pageId}`) && init?.method === "POST") {
        return jsonResponse({ id: pageId });
      }
      throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${url}`);
    }),
  );
}

describe("saveAboutAction", () => {
  function buildAboutFormData(): FormData {
    const formData = new FormData();
    formData.set("sectionLabel", ABOUT_DEFAULTS.sectionLabel);
    formData.set("heading", ABOUT_DEFAULTS.heading);
    for (const paragraph of ABOUT_DEFAULTS.storyParagraphs) {
      formData.append("storyParagraphs", paragraph);
    }
    formData.set("mission", ABOUT_DEFAULTS.mission);
    formData.set("vision", ABOUT_DEFAULTS.vision);
    formData.set("quoteText", ABOUT_DEFAULTS.quote.text);
    formData.set("quoteAuthor", ABOUT_DEFAULTS.quote.author);
    formData.set("bannerHeading", ABOUT_DEFAULTS.featureBanner.heading);
    formData.set("bannerBody", ABOUT_DEFAULTS.featureBanner.body);
    formData.set("bannerImageMediaId", "14");
    formData.set("bannerImageAlt", ABOUT_DEFAULTS.featureBanner.image.alt);
    return formData;
  }

  it("requires admin before doing anything else", async () => {
    stubWordpressSaveFor("site-about", 2);
    await saveAboutAction(null, buildAboutFormData());
    expect(requireAdmin).toHaveBeenCalled();
  });

  it("saves with the existing media id when no new file is selected", async () => {
    stubWordpressSaveFor("site-about", 2);
    const result = await saveAboutAction(null, buildAboutFormData());
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
  });

  it("returns a validation error for an empty story paragraph list", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const formData = buildAboutFormData();
    formData.delete("storyParagraphs");

    const result = await saveAboutAction(null, formData);
    expect(result.status).toBe("validation_error");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("saveAdmissionAction", () => {
  function buildAdmissionFormData(): FormData {
    const formData = new FormData();
    formData.set("sectionLabel", ADMISSION_DEFAULTS.sectionLabel);
    formData.set("heading", ADMISSION_DEFAULTS.heading);
    formData.set("intro", ADMISSION_DEFAULTS.intro);
    formData.set("backgroundImageMediaId", "13");
    formData.set("backgroundImageAlt", ADMISSION_DEFAULTS.backgroundImage.alt);
    formData.set("programsJson", JSON.stringify(ADMISSION_DEFAULTS.programs));
    formData.set(
      "requirementCategoriesJson",
      JSON.stringify(ADMISSION_DEFAULTS.requirementCategories),
    );
    formData.set(
      "enrollmentStepsJson",
      JSON.stringify(ADMISSION_DEFAULTS.enrollmentSteps),
    );
    return formData;
  }

  it("requires admin before doing anything else", async () => {
    stubWordpressSaveFor("site-admission", 3);
    await saveAdmissionAction(null, buildAdmissionFormData());
    expect(requireAdmin).toHaveBeenCalled();
  });

  it("saves successfully with valid repeatable JSON fields", async () => {
    stubWordpressSaveFor("site-admission", 3);
    const result = await saveAdmissionAction(null, buildAdmissionFormData());
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
  });

  it("returns a validation error for an empty requirement category list", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const formData = buildAdmissionFormData();
    formData.set("requirementCategoriesJson", "[]");

    const result = await saveAdmissionAction(null, formData);
    expect(result.status).toBe("validation_error");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("saveContactAction", () => {
  function buildContactFormData(): FormData {
    const formData = new FormData();
    formData.set("sectionLabel", CONTACT_DEFAULTS.sectionLabel);
    formData.set("heading", CONTACT_DEFAULTS.heading);
    formData.set("intro", CONTACT_DEFAULTS.intro);
    formData.set("cardsJson", JSON.stringify(CONTACT_DEFAULTS.cards));
    return formData;
  }

  it("requires admin before doing anything else", async () => {
    stubWordpressSaveFor("site-contact", 4);
    await saveContactAction(null, buildContactFormData());
    expect(requireAdmin).toHaveBeenCalled();
  });

  it("saves successfully and revalidates the homepage", async () => {
    stubWordpressSaveFor("site-contact", 4);
    const result = await saveContactAction(null, buildContactFormData());
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
  });

  it("returns a validation error for an empty card list", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const formData = buildContactFormData();
    formData.set("cardsJson", "[]");

    const result = await saveContactAction(null, formData);
    expect(result.status).toBe("validation_error");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("saveClubsAction", () => {
  function buildClubsFormData(): FormData {
    const formData = new FormData();
    formData.set("sectionLabel", CLUBS_DEFAULTS.sectionLabel);
    formData.set("heading", CLUBS_DEFAULTS.heading);
    formData.set("intro", CLUBS_DEFAULTS.intro);
    formData.set("clubsJson", JSON.stringify(CLUBS_DEFAULTS.clubs));
    return formData;
  }

  it("requires admin before doing anything else", async () => {
    stubWordpressSaveFor("site-clubs", 5);
    await saveClubsAction(null, buildClubsFormData());
    expect(requireAdmin).toHaveBeenCalled();
  });

  it("saves successfully and revalidates the homepage", async () => {
    stubWordpressSaveFor("site-clubs", 5);
    const result = await saveClubsAction(null, buildClubsFormData());
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
  });

  it("returns a validation error for an empty club list", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const formData = buildClubsFormData();
    formData.set("clubsJson", "[]");

    const result = await saveClubsAction(null, formData);
    expect(result.status).toBe("validation_error");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("saveGalleryAction", () => {
  function buildGalleryFormData(): FormData {
    const formData = new FormData();
    formData.set("sectionLabel", GALLERY_DEFAULTS.sectionLabel);
    formData.set("heading", GALLERY_DEFAULTS.heading);
    formData.set("intro", GALLERY_DEFAULTS.intro);
    formData.set(
      "photosJson",
      JSON.stringify([{ mediaId: 20, alt: "Field day", caption: "Field day" }]),
    );
    return formData;
  }

  it("requires admin before doing anything else", async () => {
    stubWordpressSaveFor("site-gallery", 6);
    await saveGalleryAction(null, buildGalleryFormData());
    expect(requireAdmin).toHaveBeenCalled();
  });

  it("saves with the existing media id when no new file is selected", async () => {
    stubWordpressSaveFor("site-gallery", 6);
    const result = await saveGalleryAction(null, buildGalleryFormData());
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
  });

  it("allows an empty photo list", async () => {
    stubWordpressSaveFor("site-gallery", 6);
    const formData = buildGalleryFormData();
    formData.set("photosJson", "[]");

    const result = await saveGalleryAction(null, formData);
    expect(result.status).toBe("success");
  });

  it("uploads a new photo and uses its media id when a file is provided for a newly added photo", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes("/pages?slug=site-gallery")) {
          return jsonResponse([{ id: 6, meta: { fgs_section_data: "{}" } }]);
        }
        if (url.endsWith("/media") && init?.method === "POST") {
          return jsonResponse({
            id: 88,
            source_url: `${BASE}/wp-content/uploads/new-photo.jpg`,
          });
        }
        if (url.endsWith("/pages/6") && init?.method === "POST") {
          const body = JSON.parse(String(init.body));
          expect(body.meta.fgs_section_data).toContain('"mediaId":88');
          return jsonResponse({ id: 6 });
        }
        throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${url}`);
      }),
    );

    const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
    const file = new File([jpegHeader], "new-photo.jpg");
    const formData = new FormData();
    formData.set("sectionLabel", GALLERY_DEFAULTS.sectionLabel);
    formData.set("heading", GALLERY_DEFAULTS.heading);
    formData.set("intro", GALLERY_DEFAULTS.intro);
    formData.set(
      "photosJson",
      JSON.stringify([{ mediaId: 0, alt: "New photo", caption: "" }]),
    );
    formData.set("photoFile-0", file);

    const result = await saveGalleryAction(null, formData);
    expect(result.status).toBe("success");
  });

  it("returns a validation error when a photo has no media id and no uploaded file", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("/pages?slug=site-gallery")) {
        return jsonResponse([{ id: 6, meta: { fgs_section_data: "{}" } }]);
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const formData = new FormData();
    formData.set("sectionLabel", GALLERY_DEFAULTS.sectionLabel);
    formData.set("heading", GALLERY_DEFAULTS.heading);
    formData.set("intro", GALLERY_DEFAULTS.intro);
    formData.set(
      "photosJson",
      JSON.stringify([{ mediaId: 0, alt: "No file", caption: "" }]),
    );

    const result = await saveGalleryAction(null, formData);
    expect(result.status).toBe("validation_error");
  });
});
