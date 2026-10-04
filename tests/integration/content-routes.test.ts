import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rows: vi.fn(), readMediaFile: vi.fn() }));
vi.mock("@/lib/content/db", () => ({ rows: mocks.rows }));
vi.mock("@/lib/content/media", () => ({ readMediaFile: mocks.readMediaFile }));
import { GET as legacy } from "@/app/[...legacy]/route";
import { GET as media } from "@/app/media/[...path]/route";
beforeEach(() => vi.resetAllMocks());
describe("public content routes", () => {
  it("redirects legacy articles with an exact mapping", async () => {
    mocks.rows.mockResolvedValue([{ target: "/news/original-slug" }]);
    const result = await legacy(new Request("http://0.0.0.0:3000/old-story/"), {
      params: Promise.resolve({ legacy: ["old-story"] }),
    });
    expect(result.status).toBe(301);
    expect(result.headers.get("location")).toBe("/news/original-slug");
  });
  it("distinguishes missing mappings and outages", async () => {
    const context = { params: Promise.resolve({ legacy: ["unknown"] }) };
    mocks.rows.mockResolvedValue([]);
    expect(
      (await legacy(new Request("https://school.example/unknown"), context))
        .status,
    ).toBe(404);
    mocks.rows.mockRejectedValue(new Error("offline"));
    expect(
      (await legacy(new Request("https://school.example/unknown"), context))
        .status,
    ).toBe(503);
  });
  it.each([
    "//outside.example",
    "/\\outside.example",
    "https://outside.example",
  ])("rejects unsafe legacy target %s", async (target) => {
    mocks.rows.mockResolvedValue([{ target }]);
    expect(
      (
        await legacy(new Request("https://school.example/old"), {
          params: Promise.resolve({ legacy: ["old"] }),
        })
      ).status,
    ).toBe(404);
  });
  it("rejects traversal before looking up a file", async () => {
    expect(
      (
        await media(new Request("https://school.example/media/test"), {
          params: Promise.resolve({ path: ["..", "secret"] }),
        })
      ).status,
    ).toBe(404);
    expect(mocks.rows).not.toHaveBeenCalled();
  });
  it("serves registered immutable images and conditional responses", async () => {
    mocks.rows.mockResolvedValue([
      { mime_type: "image/png", checksum: "digest", filename: "photo.png" },
    ]);
    mocks.readMediaFile.mockResolvedValue(Buffer.from("photo"));
    const context = { params: Promise.resolve({ path: ["ab", "photo.png"] }) };
    const result = await media(
      new Request("https://school.example/media/ab/photo.png"),
      context,
    );
    expect(result.status).toBe(200);
    expect(result.headers.get("content-type")).toBe("image/png");
    expect(result.headers.get("x-content-type-options")).toBe("nosniff");
    expect(await result.text()).toBe("photo");
    const cached = await media(
      new Request("https://school.example/media/ab/photo.png", {
        headers: { "If-None-Match": '"digest"' },
      }),
      context,
    );
    expect(cached.status).toBe(304);
  });
  it("forces active imported content to download", async () => {
    mocks.rows.mockResolvedValue([
      { mime_type: "image/svg+xml", checksum: "digest" },
    ]);
    mocks.readMediaFile.mockResolvedValue(
      Buffer.from("<svg><script>bad()</script></svg>"),
    );
    const result = await media(
      new Request("https://school.example/media/a.svg"),
      { params: Promise.resolve({ path: ["a.svg"] }) },
    );
    expect(result.headers.get("content-disposition")).toBe("attachment");
    expect(result.headers.get("content-type")).toBe("application/octet-stream");
  });
});
