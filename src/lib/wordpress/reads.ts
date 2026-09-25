import "server-only";
import type { z } from "zod";

import { wordpressPublicFetch } from "@/lib/wordpress/client";
import { resolveArticleCategoryIds } from "@/lib/wordpress/categories";
import {
  wpMediaSchema,
  wpPostListSchema,
  wpPostSchema,
} from "@/lib/wordpress/schemas";
import {
  sanitizeArticleHtml,
  sanitizeToPlainText,
} from "@/lib/wordpress/sanitize";
import {
  ARTICLE_CATEGORIES,
  type Article,
  type ArticleCategorySlug,
  type ArticleDetailResult,
  type ArticleImage,
  type ArticleListResult,
} from "@/lib/wordpress/types";

type WpPost = z.infer<typeof wpPostSchema>;

const ARTICLES_TAG = "wp:articles";
// INTERIM: no DEC-105 webhook exists yet, so native WordPress edits are only
// picked up by this short time-based revalidation. Admin-published articles
// also get an immediate revalidatePath() call — see publish-actions.ts.
const ARTICLES_REVALIDATE_SECONDS = 60;

async function fetchCoverImage(mediaId: number): Promise<ArticleImage | null> {
  if (!mediaId) return null;

  let response: Response;
  try {
    response = await wordpressPublicFetch(`/media/${mediaId}`, {
      revalidate: ARTICLES_REVALIDATE_SECONDS,
      tags: [ARTICLES_TAG],
    });
  } catch {
    return null;
  }
  // Deleted/missing media: degrade gracefully, no cover image.
  if (!response.ok) return null;

  const parsed = wpMediaSchema.safeParse(await response.json());
  if (!parsed.success) return null;

  const caption = parsed.data.caption?.rendered
    ? sanitizeToPlainText(parsed.data.caption.rendered)
    : "";

  return {
    url: parsed.data.source_url,
    alt: parsed.data.alt_text || "",
    caption: caption || null,
  };
}

function resolveCategorySlug(
  postCategoryIds: number[],
  bySlug: Partial<Record<ArticleCategorySlug, number>>,
): ArticleCategorySlug | null {
  for (const slug of ARTICLE_CATEGORIES) {
    const id = bySlug[slug];
    if (id !== undefined && postCategoryIds.includes(id)) return slug;
  }
  return null;
}

async function mapPostToArticle(
  post: WpPost,
  bySlug: Partial<Record<ArticleCategorySlug, number>>,
): Promise<Article | null> {
  const category = resolveCategorySlug(post.categories, bySlug);
  if (!category) return null;

  return {
    id: post.id,
    slug: post.slug,
    title: sanitizeToPlainText(post.title.rendered),
    category,
    publishedAt: post.date_gmt ? `${post.date_gmt}Z` : null,
    excerpt: sanitizeToPlainText(post.excerpt.rendered),
    contentHtml: sanitizeArticleHtml(post.content.rendered),
    coverImage: await fetchCoverImage(post.featured_media),
  };
}

/** Published articles in the three allowed categories only, newest first. */
export async function getPublishedArticles(): Promise<ArticleListResult> {
  const bySlug = await resolveArticleCategoryIds();
  if (!bySlug) return { status: "unavailable" };

  const categoryIds = Object.values(bySlug).filter(
    (id): id is number => id !== undefined,
  );
  if (categoryIds.length === 0) return { status: "ok", articles: [] };

  let response: Response;
  try {
    response = await wordpressPublicFetch(
      `/posts?status=publish&per_page=50&orderby=date&order=desc&categories=${categoryIds.join(",")}`,
      { revalidate: ARTICLES_REVALIDATE_SECONDS, tags: [ARTICLES_TAG] },
    );
  } catch {
    return { status: "unavailable" };
  }
  if (!response.ok) return { status: "unavailable" };

  const parsed = wpPostListSchema.safeParse(await response.json());
  if (!parsed.success) return { status: "unavailable" };

  const articles = (
    await Promise.all(parsed.data.map((post) => mapPostToArticle(post, bySlug)))
  ).filter((article): article is Article => article !== null);

  return { status: "ok", articles };
}

/** A single published article by slug, restricted to the three allowed categories. */
export async function getArticleBySlug(
  slug: string,
): Promise<ArticleDetailResult> {
  const bySlug = await resolveArticleCategoryIds();
  if (!bySlug) return { status: "unavailable" };

  let response: Response;
  try {
    response = await wordpressPublicFetch(
      `/posts?slug=${encodeURIComponent(slug)}&status=publish&per_page=1`,
      {
        revalidate: ARTICLES_REVALIDATE_SECONDS,
        tags: [ARTICLES_TAG, `wp:article:${slug}`],
      },
    );
  } catch {
    return { status: "unavailable" };
  }
  if (!response.ok) return { status: "unavailable" };

  const parsed = wpPostListSchema.safeParse(await response.json());
  if (!parsed.success) return { status: "unavailable" };
  if (parsed.data.length === 0) return { status: "not-found" };

  const article = await mapPostToArticle(parsed.data[0], bySlug);
  if (!article) return { status: "not-found" };

  return { status: "ok", article };
}
