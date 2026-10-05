import type { ArticleCategorySlug } from "@/lib/content/types";

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategorySlug, string> = {
  announcements: "Announcements",
  events: "Events",
  clubs: "Clubs",
  pta: "PTA",
  alumni: "Alumni",
};

export function formatArticleDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Full month/day/year, for admin contexts that need the precise publish date. */
export function formatArticleDateFull(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Categories with their own public area; kept out of the school News & Events feed. */
export const SEPARATE_AREA_CATEGORIES = [
  "pta",
  "alumni",
] as const satisfies readonly ArticleCategorySlug[];

/** Query options listing only the articles that belong to a category's own area. */
export function articleAreaOptions(category: ArticleCategorySlug) {
  return category === "pta" || category === "alumni"
    ? { categories: [category] }
    : { excludeCategories: SEPARATE_AREA_CATEGORIES };
}

/** Where an article's back and "view all" links go: its own area. */
export function articleAreaNav(category: ArticleCategorySlug) {
  if (category === "pta")
    return {
      href: "/pta",
      backLabel: "Back to PTA",
      moreHeading: "More PTA Activities",
      allLabel: "View All PTA Activities →",
    };
  if (category === "alumni")
    return {
      href: "/alumni",
      backLabel: "Back to Alumni",
      moreHeading: "More Alumni Activities",
      allLabel: "View All Alumni Activities →",
    };
  return {
    href: "/#news",
    backLabel: "Back to News & Events",
    moreHeading: "More News & Updates",
    allLabel: "View All News →",
  };
}
