import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: vi.fn(async () => ({ email: "admin@fgs.local" })),
}));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}));

const { updateArticleAction } =
  await import("@/app/admin/(protected)/articles/[id]/edit/actions");
const { trashArticleAction } =
  await import("@/app/admin/(protected)/articles/actions");
const { requireAdmin } = await import("@/lib/auth/require-admin");

const BASE = "http://localhost:8080";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const CATEGORIES = [{ id: 4, slug: "announcements", name: "Announcements" }];

function buildEditFormData(overrides: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.set("title", "A valid title");
  formData.set("category", "announcements");
  formData.set("body", "Body text.");
  formData.set("imageIds", "");
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

function stubWordpressUpdate() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes("/categories")) return jsonResponse(CATEGORIES);
      if (url.endsWith("/posts/42") && init?.method === "POST") {
        return jsonResponse({
          id: 42,
          slug: "a-valid-title",
          status: "publish",
        });
      }
      throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${url}`);
    }),
  );
}

describe("updateArticleAction", () => {
  it("requires admin before doing anything else", async () => {
    stubWordpressUpdate();
    await updateArticleAction(42, null, buildEditFormData());
    expect(requireAdmin).toHaveBeenCalled();
  });

  it("saves successfully and revalidates the home page and article path", async () => {
    stubWordpressUpdate();
    const result = await updateArticleAction(42, null, buildEditFormData());
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.cacheWarning).toBe(false);
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/news/a-valid-title");
  });

  it("reports a cache warning (not a failure) when revalidation throws after a successful save", async () => {
    revalidatePathMock.mockImplementation(() => {
      throw new Error("cache backend unavailable");
    });
    stubWordpressUpdate();

    const result = await updateArticleAction(42, null, buildEditFormData());
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.cacheWarning).toBe(true);
  });

  it("returns a validation error without writing to WordPress for an invalid title", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await updateArticleAction(
      42,
      null,
      buildEditFormData({ title: "ab" }),
    );
    expect(result.status).toBe("validation_error");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("trashArticleAction", () => {
  it("requires admin before doing anything else", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.endsWith("/posts/42") && init?.method === "DELETE") {
          return jsonResponse({ id: 42, status: "trash" });
        }
        throw new Error(`Unexpected request: ${url}`);
      }),
    );

    await trashArticleAction(42, "/news/a-valid-title");
    expect(requireAdmin).toHaveBeenCalled();
  });

  it("moves the article to trash and revalidates the home page, article list, and article path", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.endsWith("/posts/42") && init?.method === "DELETE") {
          return jsonResponse({ id: 42, status: "trash" });
        }
        throw new Error(`Unexpected request: ${url}`);
      }),
    );

    const result = await trashArticleAction(42, "/news/a-valid-title");
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.cacheWarning).toBe(false);
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/articles");
    expect(revalidatePathMock).toHaveBeenCalledWith("/news/a-valid-title");
  });

  it("reports a cache warning (not a failure) when revalidation throws after a successful trash", async () => {
    revalidatePathMock.mockImplementation(() => {
      throw new Error("cache backend unavailable");
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.endsWith("/posts/42") && init?.method === "DELETE") {
          return jsonResponse({ id: 42, status: "trash" });
        }
        throw new Error(`Unexpected request: ${url}`);
      }),
    );

    const result = await trashArticleAction(42, "/news/a-valid-title");
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.cacheWarning).toBe(true);
  });

  it("returns not-found without a cache warning when the article is already gone", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Not Found", { status: 404 })),
    );

    const result = await trashArticleAction(999, "/news/gone");
    expect(result.status).toBe("not-found");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
