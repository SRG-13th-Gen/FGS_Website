import { describe, expect, it } from "vitest";

import {
  ADMIN_NAV_GROUPS,
  getActiveAdminNavHref,
  getAdminPageTitle,
} from "@/components/admin/admin-nav";

const itemHrefs = ADMIN_NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));

describe("admin navigation groups", () => {
  it("adds Alumni and PTA groups with the agreed items", () => {
    const group = (label: string) =>
      ADMIN_NAV_GROUPS.find((g) => g.label === label)?.items.map((i) => [
        i.label,
        i.href,
      ]);
    expect(group("Alumni")).toEqual([
      ["Alumni Achievements", "/admin/sections/alumni"],
      ["Alumni Activities", "/admin/alumni/activities"],
    ]);
    expect(group("PTA")).toEqual([["PTA Activities", "/admin/pta/activities"]]);
    expect(group("News & Events")).toEqual([
      ["All News", "/admin/articles"],
      ["Add New", "/admin/articles/new"],
    ]);
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

  it("does not highlight All News on the Add New page", () => {
    expect(getActiveAdminNavHref("/admin/articles/new")).toBe(
      "/admin/articles/new",
    );
  });

  it("keeps All News active while editing an article", () => {
    expect(getActiveAdminNavHref("/admin/articles/12/edit")).toBe(
      "/admin/articles",
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
    ["/admin/alumni/activities", "Alumni Activities"],
    ["/admin/pta/activities", "PTA Activities"],
    ["/admin/articles", "All News"],
    ["/admin/articles/new", "Add New"],
    ["/admin/articles/7/edit", "Edit News & Events"],
    ["/admin/somewhere-else", "Admin"],
  ])("%s -> %s", (pathname, title) => {
    expect(getAdminPageTitle(pathname)).toBe(title);
  });
});
