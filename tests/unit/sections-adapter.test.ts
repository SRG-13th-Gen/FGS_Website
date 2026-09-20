import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createSectionAdapter } from "@/lib/wordpress/sections/adapter";
import { z } from "zod";

const BASE = "http://localhost:8080";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const testSchema = z.object({ title: z.string().min(3) });
const testDefaults = { title: "Default Title" };

beforeEach(() => {
  vi.stubEnv("WORDPRESS_URL", BASE);
  vi.stubEnv("WORDPRESS_USERNAME", "user");
  vi.stubEnv("WORDPRESS_APPLICATION_PASSWORD", "pass");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("createSectionAdapter().get()", () => {
  it("returns parsed content when the page and meta are valid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/pages")) {
          return jsonResponse([
            {
              id: 1,
              meta: {
                fgs_section_data: JSON.stringify({ title: "Real Title" }),
              },
            },
          ]);
        }
        throw new Error(`Unexpected URL: ${url}`);
      }),
    );

    const adapter = createSectionAdapter(
      "site-about",
      testSchema,
      testDefaults,
    );
    expect(await adapter.get()).toEqual({ title: "Real Title" });
  });

  it("falls back to defaults when the page does not exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse([])),
    );

    const adapter = createSectionAdapter(
      "site-about",
      testSchema,
      testDefaults,
    );
    expect(await adapter.get()).toEqual(testDefaults);
  });

  it("falls back to defaults when the meta field is empty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse([{ id: 1, meta: { fgs_section_data: "" } }]),
      ),
    );

    const adapter = createSectionAdapter(
      "site-about",
      testSchema,
      testDefaults,
    );
    expect(await adapter.get()).toEqual(testDefaults);
  });

  it("falls back to defaults when the stored content fails schema validation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse([
          {
            id: 1,
            meta: { fgs_section_data: JSON.stringify({ title: "ab" }) },
          },
        ]),
      ),
    );

    const adapter = createSectionAdapter(
      "site-about",
      testSchema,
      testDefaults,
    );
    expect(await adapter.get()).toEqual(testDefaults);
  });

  it("falls back to defaults when WordPress is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    const adapter = createSectionAdapter(
      "site-about",
      testSchema,
      testDefaults,
    );
    expect(await adapter.get()).toEqual(testDefaults);
  });
});

describe("createSectionAdapter().save()", () => {
  it("returns validation_error and never calls WordPress when input is invalid", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const adapter = createSectionAdapter(
      "site-about",
      testSchema,
      testDefaults,
    );
    const result = await adapter.save({ title: "ab" });
    expect(result.status).toBe("validation_error");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("saves successfully when the page exists", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes("/pages?slug=") && (!init || init.method !== "POST")) {
          return jsonResponse([{ id: 1, meta: { fgs_section_data: "{}" } }]);
        }
        if (url.endsWith("/pages/1") && init?.method === "POST") {
          return jsonResponse({ id: 1 });
        }
        throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${url}`);
      }),
    );

    const adapter = createSectionAdapter(
      "site-about",
      testSchema,
      testDefaults,
    );
    const result = await adapter.save({ title: "A valid title" });
    expect(result).toEqual({ status: "success", cacheWarning: false });
  });

  it("returns an error telling the admin to seed first when the page is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse([])),
    );

    const adapter = createSectionAdapter(
      "site-about",
      testSchema,
      testDefaults,
    );
    const result = await adapter.save({ title: "A valid title" });
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toMatch(/wp:seed-content/);
    }
  });
});
