import { describe, expect, it } from "vitest";

import { shouldSeedSectionContent } from "@/lib/wordpress/sections/seed-logic";

describe("shouldSeedSectionContent", () => {
  it("seeds when the meta value is undefined (page never had it set)", () => {
    expect(shouldSeedSectionContent(undefined)).toBe(true);
  });

  it("seeds when the meta value is an empty string", () => {
    expect(shouldSeedSectionContent("")).toBe(true);
  });

  it("seeds when the meta value is whitespace only", () => {
    expect(shouldSeedSectionContent("   ")).toBe(true);
  });

  it("seeds when the meta value is an empty JSON object placeholder", () => {
    expect(shouldSeedSectionContent("{}")).toBe(true);
    expect(shouldSeedSectionContent("  {}  ")).toBe(true);
  });

  it("does not seed over real seeded content (idempotent re-run)", () => {
    expect(shouldSeedSectionContent('{"heading":"Welcome"}')).toBe(false);
  });

  it("does not seed over content an admin has edited", () => {
    expect(
      shouldSeedSectionContent('{"heading":"A totally different heading now"}'),
    ).toBe(false);
  });
});
