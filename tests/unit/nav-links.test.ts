import { describe, expect, it } from "vitest";

import {
  NAV_ITEMS,
  getAriaCurrent,
  getCurrentNavHref,
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

describe("NAV_ITEMS", () => {
  it("lists the nine items in the agreed order", () => {
    expect(NAV_ITEMS.map((item) => item.label)).toEqual([
      "Home",
      "About Us",
      "Admission",
      "News & Events",
      "PTA",
      "Alumni",
      "Clubs",
      "Gallery",
      "Contact Us",
    ]);
  });

  it("uses route links for PTA and Alumni and homepage sections for the rest", () => {
    const routes = NAV_ITEMS.filter((item) => item.kind === "route");
    expect(routes.map((item) => item.href)).toEqual(["/pta", "/alumni"]);
    for (const item of NAV_ITEMS.filter((i) => i.kind === "anchor"))
      expect(item.href).toMatch(/^\/#[a-z]+$/);
  });
});

describe("getCurrentNavHref", () => {
  it("follows the section in view on the homepage", () => {
    expect(getCurrentNavHref("/", "/#clubs")).toBe("/#clubs");
  });

  it("marks the matching route tab on /pta and /alumni", () => {
    expect(getCurrentNavHref("/pta", "/#home")).toBe("/pta");
    expect(getCurrentNavHref("/alumni", "/#clubs")).toBe("/alumni");
  });

  it("marks nothing on an article or other pages", () => {
    expect(getCurrentNavHref("/news/some-article", "/#home")).toBeNull();
    expect(getCurrentNavHref("/admin", "/#home")).toBeNull();
    expect(getCurrentNavHref(null, "/#home")).toBeNull();
  });

  it("does not match a route that only shares a prefix", () => {
    expect(getCurrentNavHref("/ptafoo", "/#home")).toBeNull();
    expect(getCurrentNavHref("/alumni-news", "/#home")).toBeNull();
  });
});

describe("getAriaCurrent", () => {
  const item = (href: string) => NAV_ITEMS.find((i) => i.href === href)!;

  it("uses page for a route tab and location for a section", () => {
    expect(getAriaCurrent(item("/pta"), "/pta")).toBe("page");
    expect(getAriaCurrent(item("/#about"), "/#about")).toBe("location");
  });

  it("is absent for every other item", () => {
    expect(getAriaCurrent(item("/alumni"), "/pta")).toBeUndefined();
    expect(getAriaCurrent(item("/#home"), null)).toBeUndefined();
  });
});
