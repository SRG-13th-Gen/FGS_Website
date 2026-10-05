import { describe, expect, it } from "vitest";

import {
  isHomepage,
  sectionHref,
  sectionId,
} from "@/components/public/nav-links";

describe("section links", () => {
  it("point at the homepage so they work from every route", () => {
    expect(sectionHref("about")).toBe("/#about");
    expect(sectionHref("news")).toBe("/#news");
  });

  it("round-trip to the target element id", () => {
    expect(sectionId(sectionHref("admission"))).toBe("admission");
    expect(sectionId("#clubs")).toBe("clubs");
  });
});

describe("isHomepage", () => {
  it("is true only for the homepage", () => {
    expect(isHomepage("/")).toBe(true);
    for (const path of [
      "/pta",
      "/alumni",
      "/news/some-article",
      "/admin",
      null,
    ])
      expect(isHomepage(path)).toBe(false);
  });
});
