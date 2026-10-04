import "server-only";
import { rows, isoDate } from "./db";
import { mediaUrl } from "./media";
import { buildArticleContent } from "./blocks";
import { sanitizeArticleHtml } from "./sanitize";
import type { Article, ArticleDetailResult, ArticleListResult } from "./types";
import type { RowDataPacket } from "mysql2/promise";
export async function articleImages(id: number) {
  return rows(
    "SELECT i.media_id, i.alt, i.caption, m.path FROM article_images i JOIN media m ON m.id = i.media_id WHERE i.article_id = ? ORDER BY i.position",
    [id],
  );
}
async function toArticle(row: RowDataPacket): Promise<Article> {
  const images = (await articleImages(row.id)).map((i) => ({
    mediaId: Number(i.media_id),
    url: mediaUrl(i.path),
    alt: String(i.alt),
    caption: String(i.caption),
  }));
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    category: row.category,
    publishedAt: isoDate(row.published_at),
    excerpt: String(row.body).replace(/\n/g, " ").slice(0, 300),
    contentHtml: sanitizeArticleHtml(
      buildArticleContent(row.body, images.slice(1)),
    ),
    coverImage: images[0] ?? null,
  };
}
export async function getPublishedArticles(): Promise<ArticleListResult> {
  try {
    const items = await rows(
      "SELECT * FROM articles WHERE status = 'publish' ORDER BY published_at DESC, id DESC",
    );
    return { status: "ok", articles: await Promise.all(items.map(toArticle)) };
  } catch {
    return { status: "unavailable" };
  }
}
export async function getArticleBySlug(
  slug: string,
): Promise<ArticleDetailResult> {
  if (!slug || slug.length > 200) return { status: "not-found" };
  try {
    const [item] = await rows(
      "SELECT * FROM articles WHERE slug = ? AND status = 'publish'",
      [slug],
    );
    return item
      ? { status: "ok", article: await toArticle(item) }
      : { status: "not-found" };
  } catch {
    return { status: "unavailable" };
  }
}
