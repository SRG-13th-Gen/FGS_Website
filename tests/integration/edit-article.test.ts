import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { trashArticle, updateArticle } from "@/lib/wordpress/edit-article";
import type { UpdateArticleInput } from "@/lib/wordpress/edit-article";

const BASE = "http://localhost:8080";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const CATEGORIES = [
  { id: 4, slug: "announcements", name: "Announcements" },
  { id: 2, slug: "clubs", name: "Clubs" },
  { id: 3, slug: "events", name: "Events" },
];

function makeImageFile(name = "photo.jpg"): File {
  const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
  return new File([jpegHeader], name);
}

function baseInput(
  overrides: Partial<UpdateArticleInput> = {},
): UpdateArticleInput {
  return {
    postId: 42,
    title: "Updated Title",
    category: "announcements",
    body: "Updated body.",
    images: [],
    ...overrides,
  };
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

describe("updateArticle", () => {
  it("rejects invalid input before any request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await updateArticle(baseInput({ title: "ab" }));
    expect(result.status).toBe("validation_error");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reuses an unchanged photo's existing media id instead of re-uploading it", async () => {
    const requests: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        requests.push(`${init?.method ?? "GET"} ${url}`);
        if (url.includes("/categories")) return jsonResponse(CATEGORIES);
        if (url.endsWith("/media/60") && (!init || init.method === "GET")) {
          return jsonResponse({
            id: 60,
            source_url: `${BASE}/wp-content/uploads/cover.jpg`,
          });
        }
        if (url.endsWith("/posts/42") && init?.method === "POST") {
          const body = JSON.parse(String(init.body));
          expect(body.featured_media).toBe(60);
          return jsonResponse({
            id: 42,
            slug: "updated-title",
            status: "publish",
          });
        }
        throw new Error(`Unexpected request: ${url}`);
      }),
    );

    const result = await updateArticle(
      baseInput({
        images: [
          {
            clientId: "cover-60",
            file: new File([], ""),
            caption: "",
            altText: "Cover",
            existingMediaId: 60,
          },
        ],
      }),
    );

    expect(result.status).toBe("success");
    expect(
      requests.some((r) => r.startsWith("POST") && r.includes("/media")),
    ).toBe(false);
  });

  it("uploads a newly added photo and sets it as the featured image when it's the first slot", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes("/categories")) return jsonResponse(CATEGORIES);
        if (url.endsWith("/media") && init?.method === "POST") {
          return jsonResponse({
            id: 77,
            source_url: `${BASE}/wp-content/uploads/new.jpg`,
          });
        }
        if (url.endsWith("/posts/42") && init?.method === "POST") {
          const body = JSON.parse(String(init.body));
          expect(body.featured_media).toBe(77);
          return jsonResponse({
            id: 42,
            slug: "updated-title",
            status: "publish",
          });
        }
        throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${url}`);
      }),
    );

    const result = await updateArticle(
      baseInput({
        images: [
          {
            clientId: "new-1",
            file: makeImageFile(),
            caption: "",
            altText: "New",
            existingMediaId: null,
          },
        ],
      }),
    );
    expect(result.status).toBe("success");
  });

  it("clears the featured image when every photo is removed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes("/categories")) return jsonResponse(CATEGORIES);
        if (url.endsWith("/posts/42") && init?.method === "POST") {
          const body = JSON.parse(String(init.body));
          expect(body.featured_media).toBe(0);
          return jsonResponse({
            id: 42,
            slug: "updated-title",
            status: "publish",
          });
        }
        throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${url}`);
      }),
    );

    const result = await updateArticle(baseInput({ images: [] }));
    expect(result.status).toBe("success");
  });

  it("reports uncertain (not error) when the save request times out", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes("/categories")) return jsonResponse(CATEGORIES);
        if (url.endsWith("/posts/42") && init?.method === "POST") {
          const abortError = new Error("aborted");
          abortError.name = "AbortError";
          throw abortError;
        }
        throw new Error(`Unexpected request: ${url}`);
      }),
    );

    const result = await updateArticle(baseInput());
    expect(result.status).toBe("uncertain");
  });
});

describe("trashArticle", () => {
  it("DELETEs the post without force (moves to trash, never permanent delete)", async () => {
    let capturedInit: RequestInit | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        capturedInit = init;
        if (url.endsWith("/posts/42") && init?.method === "DELETE") {
          return jsonResponse({ id: 42, status: "trash" });
        }
        throw new Error(`Unexpected request: ${url}`);
      }),
    );

    const result = await trashArticle(42);
    expect(result.status).toBe("success");
    expect(capturedInit?.method).toBe("DELETE");
  });

  it("returns not-found for a post that no longer exists", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Not Found", { status: 404 })),
    );
    const result = await trashArticle(999);
    expect(result.status).toBe("not-found");
  });

  it("reports uncertain (not error) when the trash request times out", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        const abortError = new Error("aborted");
        abortError.name = "AbortError";
        throw abortError;
      }),
    );
    const result = await trashArticle(42);
    expect(result.status).toBe("uncertain");
  });

  it("reports error when WordPress is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const result = await trashArticle(42);
    expect(result.status).toBe("error");
  });
});
