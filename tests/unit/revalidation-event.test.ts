import { describe, expect, it } from "vitest";

import {
  affectedPaths,
  affectedTags,
  revalidationEventSchema,
} from "@/lib/revalidation/event";

describe("WordPress revalidation events", () => {
  it("invalidates both article slugs after a rename", () => {
    const event = revalidationEventSchema.parse({
      kind: "post",
      id: 12,
      oldSlug: "old-title",
      newSlug: "new-title",
    });
    expect(affectedPaths(event)).toEqual([
      "/",
      "/news/old-title",
      "/news/new-title",
    ]);
    expect(affectedTags(event)).toContain("wp:articles");
  });

  it("rejects arbitrary paths and unsupported section slugs", () => {
    expect(
      revalidationEventSchema.safeParse({
        kind: "post",
        id: 1,
        oldSlug: "../admin",
      }).success,
    ).toBe(false);
    expect(
      revalidationEventSchema.safeParse({
        kind: "page",
        id: 1,
        newSlug: "unrelated",
      }).success,
    ).toBe(false);
  });

  it("refreshes article detail dependencies after school info or media changes", () => {
    const page = revalidationEventSchema.parse({
      kind: "page",
      id: 3,
      newSlug: "site-school-info",
    });
    expect(affectedPaths(page)).toContain("/news/[slug]");
    const media = revalidationEventSchema.parse({ kind: "media", id: 4 });
    expect(affectedTags(media)).toEqual(["wp:sections", "wp:articles"]);
  });
});
