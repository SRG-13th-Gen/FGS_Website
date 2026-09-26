import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath, revalidateTag }));

const { POST } = await import("@/app/api/revalidate/route");

function request(body: unknown, secret?: string): Request {
  return new Request("https://preview.school.example/api/revalidate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(secret ? { "x-fgs-revalidation-secret": secret } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("authenticated revalidation route", () => {
  beforeEach(() => {
    vi.stubEnv("REVALIDATION_SECRET", "synthetic-shared-secret");
    revalidatePath.mockReset();
    revalidateTag.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("denies missing or wrong secrets without touching caches", async () => {
    const event = { kind: "post", id: 1, newSlug: "news" };
    expect((await POST(request(event))).status).toBe(401);
    expect((await POST(request(event, "wrong"))).status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects unsupported resources and paths", async () => {
    const response = await POST(
      request(
        { kind: "post", id: 1, newSlug: "../admin" },
        "synthetic-shared-secret",
      ),
    );
    expect(response.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects oversized events even when the sender omits Content-Length", async () => {
    const response = await POST(
      request(
        { kind: "post", id: 1, newSlug: "x".repeat(5000) },
        "synthetic-shared-secret",
      ),
    );
    expect(response.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("expires article data and both old and new pages", async () => {
    const response = await POST(
      request(
        { kind: "post", id: 1, oldSlug: "old", newSlug: "new" },
        "synthetic-shared-secret",
      ),
    );
    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("wp:articles", { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith("/news/old", undefined);
    expect(revalidatePath).toHaveBeenCalledWith("/news/new", undefined);
  });

  it("reports retryable cache failures", async () => {
    revalidateTag.mockImplementationOnce(() => {
      throw new Error("cache down");
    });
    const response = await POST(
      request({ kind: "media", id: 2 }, "synthetic-shared-secret"),
    );
    expect(response.status).toBe(503);
  });
});
