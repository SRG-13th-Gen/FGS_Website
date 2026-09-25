import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { publishArticle } from "@/lib/wordpress/publish";
import type { PublishArticleInput } from "@/lib/wordpress/types";

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

beforeEach(() => {
  vi.stubEnv("WORDPRESS_URL", BASE);
  vi.stubEnv("WORDPRESS_USERNAME", "integration-user");
  vi.stubEnv("WORDPRESS_APPLICATION_PASSWORD", "app-password");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("publishArticle", () => {
  it("uploads images before creating the post, in order, with captions/alt/featured_media", async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    let mediaIdCounter = 100;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        requests.push({ url, init });

        if (url.includes("/categories")) return jsonResponse(CATEGORIES);

        if (url.endsWith("/media") && init?.method === "POST") {
          mediaIdCounter += 1;
          return jsonResponse({
            id: mediaIdCounter,
            source_url: `${BASE}/wp-content/uploads/${mediaIdCounter}.jpg`,
          });
        }

        if (url.endsWith("/posts") && init?.method === "POST") {
          return jsonResponse({
            id: 999,
            slug: "test-article",
            status: "publish",
          });
        }

        throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${url}`);
      }),
    );

    const input: PublishArticleInput = {
      title: "Science Fair Highlights",
      category: "clubs",
      body: "Paragraph one.\n\nParagraph two.",
      images: [
        {
          clientId: "a",
          file: makeImageFile("first.jpg"),
          caption: "First caption",
          altText: "First alt",
          existingMediaId: null,
        },
        {
          clientId: "b",
          file: makeImageFile("second.jpg"),
          caption: "Second caption",
          altText: "",
          existingMediaId: null,
        },
        {
          clientId: "c",
          file: makeImageFile("third.jpg"),
          caption: "Third caption",
          altText: "Third alt",
          existingMediaId: null,
        },
      ],
    };

    const result = await publishArticle(input);

    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.slug).toBe("test-article");
    expect(result.articlePath).toBe("/news/test-article");

    const mediaRequests = requests.filter(
      (r) => r.url.endsWith("/media") && r.init?.method === "POST",
    );
    expect(mediaRequests).toHaveLength(3);

    const firstFormData = mediaRequests[0].init!.body as FormData;
    expect(firstFormData.get("caption")).toBe("First caption");
    expect(firstFormData.get("alt_text")).toBe("First alt");

    const secondFormData = mediaRequests[1].init!.body as FormData;
    expect(secondFormData.get("caption")).toBe("Second caption");
    // Alt text falls back to caption when left blank.
    expect(secondFormData.get("alt_text")).toBe("Second caption");

    const postRequest = requests.find(
      (r) => r.url.endsWith("/posts") && r.init?.method === "POST",
    )!;
    const postBody = JSON.parse(String(postRequest.init!.body));
    expect(postBody.categories).toEqual([2]); // resolved "clubs" category id
    expect(postBody.status).toBe("publish");
    expect(postBody.featured_media).toBe(101); // first (cover) uploaded image
    // The cover image is shown separately, not duplicated in the body content.
    expect(postBody.content).not.toContain("wp-image-101");
    expect(postBody.content.indexOf("wp-image-102")).toBeLessThan(
      postBody.content.indexOf("wp-image-103"),
    );

    // Media uploads happen before the post is created.
    const mediaIndexes = requests
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => r.url.endsWith("/media") && r.init?.method === "POST")
      .map(({ i }) => i);
    const postIndex = requests.findIndex(
      (r) => r.url.endsWith("/posts") && r.init?.method === "POST",
    );
    expect(Math.max(...mediaIndexes)).toBeLessThan(postIndex);
  });

  it("reuses an already-uploaded image on retry instead of re-uploading it", async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        requests.push({ url, init });

        if (url.includes("/categories")) return jsonResponse(CATEGORIES);
        if (
          url.endsWith("/media/555") &&
          (!init?.method || init.method === "GET")
        ) {
          return jsonResponse({
            id: 555,
            source_url: `${BASE}/wp-content/uploads/existing.jpg`,
          });
        }
        if (url.endsWith("/media") && init?.method === "POST") {
          return jsonResponse({
            id: 600,
            source_url: `${BASE}/wp-content/uploads/new.jpg`,
          });
        }
        if (url.endsWith("/posts") && init?.method === "POST") {
          return jsonResponse({
            id: 1,
            slug: "retry-article",
            status: "publish",
          });
        }

        throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${url}`);
      }),
    );

    const input: PublishArticleInput = {
      title: "Retry Test Article",
      category: "events",
      body: "Body text.",
      images: [
        {
          clientId: "already-uploaded",
          file: makeImageFile(),
          caption: "",
          altText: "",
          existingMediaId: 555,
        },
        {
          clientId: "new-one",
          file: makeImageFile("new.jpg"),
          caption: "",
          altText: "",
          existingMediaId: null,
        },
      ],
    };

    const result = await publishArticle(input);
    expect(result.status).toBe("success");

    const mediaUploads = requests.filter(
      (r) => r.url.endsWith("/media") && r.init?.method === "POST",
    );
    expect(mediaUploads).toHaveLength(1); // only the new image was uploaded

    const mediaConfirmations = requests.filter((r) =>
      r.url.endsWith("/media/555"),
    );
    expect(mediaConfirmations).toHaveLength(1); // reused, not re-uploaded
  });

  it("returns an uncertain result (not an error, and not a retry) when post creation times out", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes("/categories")) return jsonResponse(CATEGORIES);
        if (url.endsWith("/media") && init?.method === "POST") {
          return jsonResponse({
            id: 700,
            source_url: `${BASE}/wp-content/uploads/img.jpg`,
          });
        }
        if (url.endsWith("/posts") && init?.method === "POST") {
          const abortError = new Error("The operation was aborted.");
          abortError.name = "AbortError";
          throw abortError;
        }
        throw new Error(`Unexpected request: ${url}`);
      }),
    );

    const input: PublishArticleInput = {
      title: "Timeout Test",
      category: "announcements",
      body: "Body.",
      images: [
        {
          clientId: "x",
          file: makeImageFile(),
          caption: "",
          altText: "",
          existingMediaId: null,
        },
      ],
    };

    const result = await publishArticle(input);
    expect(result.status).toBe("uncertain");
    if (result.status !== "uncertain") return;
    expect(result.uploadedImages).toEqual([
      {
        clientId: "x",
        mediaId: 700,
        url: `${BASE}/wp-content/uploads/img.jpg`,
      },
    ]);
    expect(result.message).toMatch(/wp-admin/i);
  });

  it("returns an error result when the category cannot be resolved", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/categories")) return jsonResponse([]);
        throw new Error(`Unexpected request: ${url}`);
      }),
    );

    const result = await publishArticle({
      title: "No Category",
      category: "events",
      body: "Body.",
      images: [],
    });
    expect(result.status).toBe("error");
  });

  it("does not call WordPress at all when field validation fails", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await publishArticle({
      title: "Hi",
      category: "events",
      body: "Body",
      images: [],
    });
    expect(result.status).toBe("validation_error");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
