import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ rows: vi.fn(), mutate: vi.fn() }));
vi.mock("@/lib/content/db", () => ({
  ...db,
  isoDate: (s: string | null) => (s ? s + "Z" : null),
}));
const media = vi.hoisted(() => ({ getMedia: vi.fn() }));
vi.mock("@/lib/content/media", () => media);

import { ALUMNI_DEFAULTS } from "@/lib/content/sections/alumni";
import { alumniContent } from "@/lib/content/sections/content";

const stored = {
  ...ALUMNI_DEFAULTS,
  achievements: [
    {
      name: "Maria Santos",
      batch: "Batch 2015",
      title: "Award",
      description: "",
      image: { mediaId: 4, alt: "Maria" },
    },
    {
      name: "Jose Reyes",
      batch: "Batch 2012",
      title: "Scholar",
      description: "",
    },
  ],
};

beforeEach(() => vi.resetAllMocks());

describe("alumniContent.getResult", () => {
  it("reports a database outage as unavailable, not as an empty list", async () => {
    db.rows.mockRejectedValue(new Error("database"));
    expect(await alumniContent.getResult()).toEqual({ status: "unavailable" });
  });

  it("falls back to the defaults when the row is missing or invalid", async () => {
    db.rows.mockResolvedValueOnce([]);
    expect(await alumniContent.getResult()).toMatchObject({
      status: "ok",
      alumni: { heading: "Alumni Achievements", achievements: [] },
    });
    db.rows.mockResolvedValueOnce([{ data: JSON.stringify({ heading: "x" }) }]);
    expect(await alumniContent.getResult()).toMatchObject({
      status: "ok",
      alumni: { achievements: [] },
    });
  });

  it("resolves photos and leaves a card without one when media is missing", async () => {
    db.rows.mockResolvedValue([{ data: JSON.stringify(stored) }]);
    media.getMedia.mockResolvedValue({ id: 4, url: "/media/maria.jpg" });
    const ok = await alumniContent.getResult();
    expect(ok).toMatchObject({ status: "ok" });
    if (ok.status !== "ok") return;
    expect(ok.alumni.achievements[0].image).toEqual({
      mediaId: 4,
      url: "/media/maria.jpg",
      alt: "Maria",
    });
    expect(ok.alumni.achievements[1].image).toBeNull();

    media.getMedia.mockResolvedValue(null);
    const missing = await alumniContent.getResult();
    expect(
      missing.status === "ok" && missing.alumni.achievements[0].image,
    ).toBeNull();
  });
});
