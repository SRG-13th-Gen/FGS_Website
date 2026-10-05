import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { ALUMNI_DEFAULTS, alumniSchema } from "@/lib/content/sections/alumni";
import { SECTION_REGISTRY } from "@/lib/content/sections/registry";
import { SECTION_SLUGS } from "@/lib/content/sections/types";

const achievement = {
  name: "Maria Santos",
  batch: "Batch 2015",
  title: "Board exam topnotcher",
  description: "",
};

describe("alumniSchema", () => {
  it("accepts the defaults, including an empty achievements list", () => {
    expect(alumniSchema.safeParse(ALUMNI_DEFAULTS).success).toBe(true);
    expect(ALUMNI_DEFAULTS.achievements).toEqual([]);
  });

  it("accepts an achievement without a photo", () => {
    const result = alumniSchema.safeParse({
      ...ALUMNI_DEFAULTS,
      achievements: [achievement],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a photo that has alt text", () => {
    const result = alumniSchema.safeParse({
      ...ALUMNI_DEFAULTS,
      achievements: [{ ...achievement, image: { mediaId: 3, alt: "Maria" } }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a photo without alt text", () => {
    for (const alt of ["", "   "]) {
      const result = alumniSchema.safeParse({
        ...ALUMNI_DEFAULTS,
        achievements: [{ ...achievement, image: { mediaId: 3, alt } }],
      });
      expect(result.success).toBe(false);
    }
  });

  it("rejects alt text over 200 characters", () => {
    const result = alumniSchema.safeParse({
      ...ALUMNI_DEFAULTS,
      achievements: [
        { ...achievement, image: { mediaId: 3, alt: "a".repeat(201) } },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("caps achievements at 24", () => {
    const build = (count: number) => ({
      ...ALUMNI_DEFAULTS,
      achievements: Array.from({ length: count }, () => achievement),
    });
    expect(alumniSchema.safeParse(build(24)).success).toBe(true);
    expect(alumniSchema.safeParse(build(25)).success).toBe(false);
  });

  it("rejects over-long achievement fields", () => {
    for (const patch of [
      { name: "n".repeat(101) },
      { batch: "b".repeat(41) },
      { title: "t".repeat(121) },
      { description: "d".repeat(401) },
      { name: " " },
    ]) {
      const result = alumniSchema.safeParse({
        ...ALUMNI_DEFAULTS,
        achievements: [{ ...achievement, ...patch }],
      });
      expect(result.success).toBe(false);
    }
  });
});

describe("site-alumni registration", () => {
  it("is a known slug that links to /alumni and is skipped by the importer", () => {
    expect(SECTION_SLUGS).toContain("site-alumni");
    const entry = SECTION_REGISTRY.find((s) => s.slug === "site-alumni");
    expect(entry).toMatchObject({
      publicAnchor: "/alumni",
      legacyImport: false,
      defaults: ALUMNI_DEFAULTS,
    });
    expect(
      SECTION_REGISTRY.filter((s) => s.legacyImport === false),
    ).toHaveLength(1);
    expect(new Set(SECTION_REGISTRY.map((s) => s.slug))).toEqual(
      new Set(SECTION_SLUGS),
    );
  });
});

describe("migration 003_alumni_pta.sql", () => {
  const sql = readFileSync("db/migrations/003_alumni_pta.sql", "utf8");
  // scripts/migrate.ts splits on ";", so only terminators may use it.
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  it("has exactly the two expected statements", () => {
    expect(statements).toHaveLength(2);
    expect(statements[0]).toMatch(
      /^ALTER TABLE articles MODIFY category ENUM\('announcements','events','clubs','pta','alumni'\) NOT NULL$/,
    );
    expect(statements[1]).toMatch(/^INSERT IGNORE INTO sections /);
  });

  it("seeds JSON equal to ALUMNI_DEFAULTS", () => {
    const literal = /VALUES \('site-alumni', '([^]*)'\)$/.exec(statements[1]);
    expect(literal).not.toBeNull();
    expect(JSON.parse(literal![1])).toEqual(ALUMNI_DEFAULTS);
  });
});
