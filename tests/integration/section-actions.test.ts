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
const { requireAdmin } = await import("@/lib/auth/require-admin");

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
