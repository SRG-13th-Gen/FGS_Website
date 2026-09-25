import "server-only";

import { wordpressPublicFetch } from "@/lib/wordpress/client";
import { wpCategoryListSchema } from "@/lib/wordpress/schemas";
import {
  ARTICLE_CATEGORIES,
  type ArticleCategorySlug,
} from "@/lib/wordpress/types";

const CATEGORIES_TAG = "wp:categories";
// Categories change rarely; revalidate hourly, well within DEC-105's interim window.
const CATEGORIES_REVALIDATE_SECONDS = 60 * 60;

/**
 * Resolves each allowed category slug to its live WordPress category ID.
 * Never hardcode IDs — they differ per WordPress install (docs/DATA_API_CONTRACTS.md).
 * Returns null when categories cannot be resolved (WordPress unreachable/misconfigured).
 */
export async function resolveArticleCategoryIds(): Promise<Partial<
  Record<ArticleCategorySlug, number>
> | null> {
  let response: Response;
  try {
    response = await wordpressPublicFetch(
      `/categories?per_page=100&_fields=id,slug,name`,
      { revalidate: CATEGORIES_REVALIDATE_SECONDS, tags: [CATEGORIES_TAG] },
    );
  } catch {
    return null;
  }

  if (!response.ok) return null;

  const parsed = wpCategoryListSchema.safeParse(await response.json());
  if (!parsed.success) return null;

  const bySlug: Partial<Record<ArticleCategorySlug, number>> = {};
  for (const category of parsed.data) {
    if ((ARTICLE_CATEGORIES as readonly string[]).includes(category.slug)) {
      bySlug[category.slug as ArticleCategorySlug] = category.id;
    }
  }
  return bySlug;
}
