import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: vi.fn(async () => ({ email: "admin@fgs.local" })),
}));

const { listMediaAction } =
  await import("@/app/admin/(protected)/media-actions");
const { requireAdmin } = await import("@/lib/auth/require-admin");

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
  vi.mocked(requireAdmin).mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("listMediaAction", () => {
  it("requires admin before doing anything else", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse([], 200, { "X-WP-Total": "0", "X-WP-TotalPages": "0" }),
      ),
    );

    await listMediaAction({ search: "", page: 1 });
    expect(requireAdmin).toHaveBeenCalled();
  });

  it("returns the list result once authorized", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(
          [
            {
              id: 1,
              source_url: `${BASE}/wp-content/uploads/a.jpg`,
              alt_text: "A",
            },
          ],
          200,
          { "X-WP-Total": "1", "X-WP-TotalPages": "1" },
        ),
      ),
    );

    const result = await listMediaAction({ search: "", page: 1 });
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.items).toEqual([
      { id: 1, url: `${BASE}/wp-content/uploads/a.jpg`, alt: "A" },
    ]);
  });
});
