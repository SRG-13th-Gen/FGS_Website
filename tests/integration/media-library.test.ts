import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { listMediaLibrary } from "@/lib/wordpress/media-library";

const BASE = "http://localhost:8080";

function jsonResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
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

describe("listMediaLibrary", () => {
  it("pushes search, pagination, and the images-only filter down to the WordPress REST query", async () => {
    let requestedUrl = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        requestedUrl = url;
        return jsonResponse([], 200, {
          "X-WP-Total": "0",
          "X-WP-TotalPages": "0",
        });
      }),
    );

    await listMediaLibrary({ search: "classroom", page: 2 });

    expect(requestedUrl).toContain("/media?");
    expect(requestedUrl).toContain("media_type=image");
    expect(requestedUrl).toContain("page=2");
    expect(requestedUrl).toContain("search=classroom");
    expect(requestedUrl).toContain("per_page=12");
  });

  it("omits the search param when no search text is given", async () => {
    let requestedUrl = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        requestedUrl = url;
        return jsonResponse([], 200, {
          "X-WP-Total": "0",
          "X-WP-TotalPages": "0",
        });
      }),
    );

    await listMediaLibrary({ search: "", page: 1 });
    expect(requestedUrl).not.toContain("search=");
  });

  it("maps media items and reads pagination headers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(
          [
            {
              id: 14,
              source_url: `${BASE}/wp-content/uploads/classroom.webp`,
              alt_text: "Classroom",
            },
            { id: 13, source_url: `${BASE}/wp-content/uploads/admission.webp` },
          ],
          200,
          { "X-WP-Total": "2", "X-WP-TotalPages": "1" },
        ),
      ),
    );

    const result = await listMediaLibrary({ search: "", page: 1 });
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);
    expect(result.items).toEqual([
      {
        id: 14,
        url: `${BASE}/wp-content/uploads/classroom.webp`,
        alt: "Classroom",
      },
      { id: 13, url: `${BASE}/wp-content/uploads/admission.webp`, alt: "" },
    ]);
  });

  it("returns unavailable when WordPress is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const result = await listMediaLibrary({ search: "", page: 1 });
    expect(result.status).toBe("unavailable");
  });

  it("returns unavailable on a non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Forbidden", { status: 403 })),
    );
    const result = await listMediaLibrary({ search: "", page: 1 });
    expect(result.status).toBe("unavailable");
  });
});
