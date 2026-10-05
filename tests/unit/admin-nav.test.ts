import { describe, expect, it } from "vitest";

import {
  ADMIN_NAV_GROUPS,
  getActiveAdminNavHref,
  getAdminPageTitle,
} from "@/components/admin/admin-nav";
import nextConfig from "../../next.config";

const itemHrefs = ADMIN_NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));

describe("admin navigation groups", () => {
  it("has the three simplified groups in order", () => {
    expect(ADMIN_NAV_GROUPS.map((g) => g.label)).toEqual([
      "Overview",
      "Website Sections",
      "Posts",
    ]);
  });

  it("lists Alumni Achievements with the other website sections", () => {
    const sections = ADMIN_NAV_GROUPS.find(
      (g) => g.label === "Website Sections",
    );
    expect(sections?.items.map((i) => [i.label, i.href])).toEqual([
      ["Hero", "/admin/sections/hero"],
      ["About", "/admin/sections/about"],
      ["Admission", "/admin/sections/admission"],
      ["Clubs", "/admin/sections/clubs"],
      ["Gallery", "/admin/sections/gallery"],
      ["Contact", "/admin/sections/contact"],
      ["School Info", "/admin/sections/school-info"],
      ["Alumni Achievements", "/admin/sections/alumni"],
    ]);
  });

  it("renames News & Events to Posts and All News to All Posts", () => {
    const posts = ADMIN_NAV_GROUPS.find((g) => g.label === "Posts");
    expect(posts?.items.map((i) => [i.label, i.href])).toEqual([
      ["All Posts", "/admin/articles"],
      ["Add New", "/admin/articles/new"],
    ]);
  });

  it("has no separate Alumni or PTA groups or activity links", () => {
    expect(ADMIN_NAV_GROUPS.map((g) => g.label)).not.toContain("Alumni");
    expect(ADMIN_NAV_GROUPS.map((g) => g.label)).not.toContain("PTA");
    expect(itemHrefs.some((href) => href.includes("/activities"))).toBe(false);
  });

  it("has unique hrefs and labels", () => {
    expect(new Set(itemHrefs).size).toBe(itemHrefs.length);
    const labels = ADMIN_NAV_GROUPS.flatMap((g) => g.items.map((i) => i.label));
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe("getActiveAdminNavHref", () => {
  it.each(itemHrefs)("activates exactly the item for %s", (href) => {
    expect(getActiveAdminNavHref(href)).toBe(href);
  });

  it("does not highlight All Posts on the Add New page", () => {
    expect(getActiveAdminNavHref("/admin/articles/new")).toBe(
      "/admin/articles/new",
    );
  });

  it("keeps All Posts active on every edit page", () => {
    expect(getActiveAdminNavHref("/admin/articles/12/edit")).toBe(
      "/admin/articles",
    );
  });

  it("ignores the query string, so a filtered All Posts is still All Posts", () => {
    // usePathname() never includes the query; a stray one must not matter.
    expect(getActiveAdminNavHref("/admin/articles")).toBe("/admin/articles");
    expect(getActiveAdminNavHref("/admin/articles/new")).toBe(
      "/admin/articles/new",
    );
  });

  it("does not match a sibling that only shares a prefix", () => {
    expect(getActiveAdminNavHref("/admin/articles-archive")).toBeNull();
    expect(getActiveAdminNavHref("/admin/sections/alumni-x")).toBeNull();
  });

  it("only activates the dashboard on /admin itself", () => {
    expect(getActiveAdminNavHref("/admin")).toBe("/admin");
    expect(getActiveAdminNavHref("/admin/unknown")).toBeNull();
  });
});

describe("getAdminPageTitle", () => {
  it.each([
    ["/admin", "Dashboard"],
    ["/admin/sections/alumni", "Alumni Achievements"],
    ["/admin/sections/school-info", "School Info"],
    ["/admin/articles", "All Posts"],
    ["/admin/articles/new", "Add New"],
    ["/admin/articles/7/edit", "Edit Post"],
    ["/admin/somewhere-else", "Admin"],
  ])("%s -> %s", (pathname, title) => {
    expect(getAdminPageTitle(pathname)).toBe(title);
  });
});

describe("retired activity routes", () => {
  it("redirect to the filtered All Posts list", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toEqual([
      {
        source: "/admin/alumni/activities",
        destination: "/admin/articles?category=alumni",
        permanent: false,
      },
      {
        source: "/admin/pta/activities",
        destination: "/admin/articles?category=pta",
        permanent: false,
      },
    ]);
  });
});
