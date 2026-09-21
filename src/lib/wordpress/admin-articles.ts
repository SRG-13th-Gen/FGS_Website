import "server-only";

import { analyzeArticleContent } from "@/lib/wordpress/article-content";
import { resolveArticleCategoryIds } from "@/lib/wordpress/categories";
import { wordpressAuthedFetch } from "@/lib/wordpress/client";
import {
  wpMediaSchema,
  wpPostEditSchema,
  wpPostSummaryListSchema,
} from "@/lib/wordpress/schemas";
import { sanitizeToPlainText } from "@/lib/wordpress/sanitize";
import {
  ARTICLE_CATEGORIES,
  type ArticleCategorySlug,
} from "@/lib/wordpress/types";

export const ADMIN_ARTICLES_PAGE_SIZE = 10;

export interface AdminArticleListItem {
  id: number;
  slug: string;
  title: string;
  category: ArticleCategorySlug | null;
  publishedAt: string | null;
  status: string;
  coverImage: { url: string; alt: string } | null;
}

export type AdminArticleListResult =
  | {
      status: "ok";
      items: AdminArticleListItem[];
      page: number;
      totalPages: number;
      total: number;
    }
  | { status: "unavailable" };

export interface AdminArticleListQuery {
  /** Trimmed search text, or "" for no search filter. */
  search: string;
  category: ArticleCategorySlug | "all";
  /** 1-based. */
  page: number;
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

async function fetchCoverMedia(
  mediaId: number,
): Promise<{ url: string; alt: string; caption: string } | null> {
  if (!mediaId) return null;
  let response: Response;
  try {
    response = await wordpressAuthedFetch(`/media/${mediaId}`, {
      method: "GET",
    });
  } catch {
    return null;
  }
  if (!response.ok) return null;

  const parsed = wpMediaSchema.safeParse(await response.json());
  if (!parsed.success) return null;
  return {
    url: parsed.data.source_url,
    alt: parsed.data.alt_text || "",
    caption: parsed.data.caption?.rendered
      ? sanitizeToPlainText(parsed.data.caption.rendered)
      : "",
  };
}

/**
 * Admin article list: search (title-only, via the mu-plugin's
 * `search_columns` scoping — see wordpress/mu-plugins/fgs-site-content.php),
 * category filter, and pagination all pushed down to the WordPress REST API
 * query — never fetch-everything-then-filter client- or server-side.
 */
export async function listArticlesForAdmin(
  query: AdminArticleListQuery,
): Promise<AdminArticleListResult> {
  const bySlug = await resolveArticleCategoryIds();
  if (!bySlug) return { status: "unavailable" };

  const params = new URLSearchParams({
    status: "publish",
    per_page: String(ADMIN_ARTICLES_PAGE_SIZE),
    page: String(query.page),
    orderby: "date",
    order: "desc",
    _fields: "id,slug,status,date_gmt,title,categories,featured_media",
  });
  if (query.search) params.set("search", query.search);
  if (query.category !== "all") {
    const categoryId = bySlug[query.category];
    // An unresolvable category filter must return zero results, not "no filter".
    if (!categoryId)
      return { status: "ok", items: [], page: 1, totalPages: 0, total: 0 };
    params.set("categories", String(categoryId));
  }

  let response: Response;
  try {
    response = await wordpressAuthedFetch(`/posts?${params.toString()}`, {
      method: "GET",
    });
  } catch {
    return { status: "unavailable" };
  }
  if (!response.ok) return { status: "unavailable" };

  const total = Number(response.headers.get("X-WP-Total") ?? 0);
  const totalPages = Number(response.headers.get("X-WP-TotalPages") ?? 0);

  const parsed = wpPostSummaryListSchema.safeParse(await response.json());
  if (!parsed.success) return { status: "unavailable" };

  const items = await Promise.all(
    parsed.data.map(async (post) => {
      const cover = await fetchCoverMedia(post.featured_media);
      return {
        id: post.id,
        slug: post.slug,
        title: sanitizeToPlainText(post.title.rendered),
        category: resolveCategorySlug(post.categories, bySlug),
        publishedAt: post.date_gmt ? `${post.date_gmt}Z` : null,
        status: post.status,
        coverImage: cover ? { url: cover.url, alt: cover.alt } : null,
      };
    }),
  );

  return { status: "ok", items, page: query.page, totalPages, total };
}

export interface EditableArticleImage {
  clientId: string;
  mediaId: number;
  url: string;
  alt: string;
  caption: string;
}

export interface EditableArticle {
  id: number;
  slug: string;
  title: string;
  category: ArticleCategorySlug | null;
  body: string;
  /** images[0], when present, is the featured/cover image — same model as publishing. */
  images: EditableArticleImage[];
}

export type ArticleForEditResult =
  | { status: "editable"; article: EditableArticle }
  | {
      status: "readonly";
      reason: string;
      title: string;
      category: ArticleCategorySlug | null;
    }
  | { status: "not-found" }
  | { status: "unavailable" };

/**
 * Fetches a single article in edit context (raw, unrendered content) and
 * decides whether the simple admin editor can safely round-trip it — see
 * article-content.ts and docs/specs/003-team-admin.md#read-only-detection-rule.
 */
export async function getArticleForEdit(
  id: number,
): Promise<ArticleForEditResult> {
  const bySlug = await resolveArticleCategoryIds();
  if (!bySlug) return { status: "unavailable" };

  let response: Response;
  try {
    response = await wordpressAuthedFetch(`/posts/${id}?context=edit`, {
      method: "GET",
    });
  } catch {
    return { status: "unavailable" };
  }
  if (response.status === 404) return { status: "not-found" };
  if (!response.ok) return { status: "unavailable" };

  const parsed = wpPostEditSchema.safeParse(await response.json());
  if (!parsed.success) return { status: "unavailable" };
  if (parsed.data.status === "trash") return { status: "not-found" };

  const post = parsed.data;
  const category = resolveCategorySlug(post.categories, bySlug);
  const title = sanitizeToPlainText(post.title.raw);

  const analysis = analyzeArticleContent(post.content.raw);
  if (!analysis.editable) {
    return { status: "readonly", reason: analysis.reason, title, category };
  }

  const cover = post.featured_media
    ? await fetchCoverMedia(post.featured_media)
    : null;

  const images: EditableArticleImage[] = [];
  if (cover) {
    images.push({
      clientId: `cover-${post.featured_media}`,
      mediaId: post.featured_media,
      url: cover.url,
      alt: cover.alt,
      caption: cover.caption,
    });
  }
  analysis.images.forEach((image, index) => {
    images.push({
      clientId: `image-${image.mediaId}-${index}`,
      mediaId: image.mediaId,
      url: image.url,
      alt: image.alt,
      caption: image.caption,
    });
  });

  return {
    status: "editable",
    article: {
      id: post.id,
      slug: post.slug,
      title,
      category,
      body: analysis.body,
      images,
    },
  };
}
