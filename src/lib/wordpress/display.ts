import type { ArticleCategorySlug } from "@/lib/wordpress/types";

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategorySlug, string> = {
  announcements: "Announcements",
  events: "Events",
  clubs: "Clubs",
};

export function formatArticleDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
