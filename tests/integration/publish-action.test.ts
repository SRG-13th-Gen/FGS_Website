import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: vi.fn(async () => ({ email: "admin@fgs.local" })),
}));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}));

const { publishArticleAction } =
  await import("@/app/admin/(protected)/publish-actions");
const { requireAdmin } = await import("@/lib/auth/require-admin");

const BASE = "http://localhost:8080";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const CATEGORIES = [{ id: 4, slug: "announcements", name: "Announcements" }];

function buildFormData(): FormData {
  const formData = new FormData();
  formData.set("title", "Announcement Title");
  formData.set("category", "announcements");
  formData.set("body", "Body text.");
  formData.set("imageIds", "");
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

describe("publishArticleAction", () => {
  it("requires admin before doing anything else", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes("/categories")) return jsonResponse(CATEGORIES);
        if (url.endsWith("/posts") && init?.method === "POST") {
          return jsonResponse({
            id: 1,
            slug: "announcement-title",
            status: "publish",
          });
        }
        throw new Error(`Unexpected request: ${url}`);
      }),
    );

    await publishArticleAction(null, buildFormData());
    expect(requireAdmin).toHaveBeenCalled();
  });

  it("revalidates the home page and the article path on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes("/categories")) return jsonResponse(CATEGORIES);
        if (url.endsWith("/posts") && init?.method === "POST") {
          return jsonResponse({
            id: 1,
            slug: "announcement-title",
            status: "publish",
          });
        }
        throw new Error(`Unexpected request: ${url}`);
      }),
    );

    const result = await publishArticleAction(null, buildFormData());
    expect(result.status).toBe("success");
    if (result.status !== "success") return;

    expect(result.cacheWarning).toBe(false);
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/news/announcement-title");
  });

  it("reports success with a cache warning when revalidation fails after a successful publish", async () => {
    revalidatePathMock.mockImplementation(() => {
      throw new Error("cache backend unavailable");
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes("/categories")) return jsonResponse(CATEGORIES);
        if (url.endsWith("/posts") && init?.method === "POST") {
          return jsonResponse({
            id: 1,
            slug: "announcement-title",
            status: "publish",
          });
        }
        throw new Error(`Unexpected request: ${url}`);
      }),
    );

    const result = await publishArticleAction(null, buildFormData());
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.cacheWarning).toBe(true);
  });
});
