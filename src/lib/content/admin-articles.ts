import "server-only";
import { rows, isoDate, type SqlValue } from "./db";
import { articleImages } from "./reads";
import { mediaUrl, pageNumber, searchPattern } from "./media";
import type { ArticleCategorySlug } from "./types";
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
  search: string;
  category: ArticleCategorySlug | "all";
  page: number;
}
export async function listArticlesForAdmin(
  query: AdminArticleListQuery,
): Promise<AdminArticleListResult> {
  try {
    const page = pageNumber(query.page);
    const where =
      "status = 'publish' AND title LIKE ?" +
      (query.category === "all" ? "" : " AND category = ?");
    const params: SqlValue[] = [searchPattern(query.search)];
    if (query.category !== "all") params.push(query.category);
    const [count] = await rows(
      "SELECT COUNT(*) AS total FROM articles WHERE " + where,
      params,
    );
    const total = Number(count.total);
    const list = await rows(
      "SELECT * FROM articles WHERE " +
        where +
        " ORDER BY published_at DESC, id DESC LIMIT " +
        ADMIN_ARTICLES_PAGE_SIZE +
        " OFFSET " +
        (page - 1) * ADMIN_ARTICLES_PAGE_SIZE,
      params,
    );
    const items = await Promise.all(
      list.map(async (a) => {
        const [cover] = await articleImages(a.id);
        return {
          id: Number(a.id),
          slug: a.slug,
          title: a.title,
          category: a.category,
          publishedAt: isoDate(a.published_at),
          status: a.status,
          coverImage: cover
            ? { url: mediaUrl(cover.path), alt: cover.alt }
            : null,
        };
      }),
    );
    return {
      status: "ok",
      items,
      page,
      total,
      totalPages: Math.ceil(total / ADMIN_ARTICLES_PAGE_SIZE),
    };
  } catch {
    return { status: "unavailable" };
  }
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
  images: EditableArticleImage[];
  revision: number;
}
export type ArticleForEditResult =
  | { status: "editable"; article: EditableArticle }
  | { status: "not-found" }
  | { status: "unavailable" };
export async function getArticleForEdit(
  id: number,
): Promise<ArticleForEditResult> {
  if (!Number.isSafeInteger(id) || id < 1) return { status: "not-found" };
  try {
    const [a] = await rows(
      "SELECT * FROM articles WHERE id = ? AND status <> 'trash'",
      [id],
    );
    if (!a) return { status: "not-found" };
    const images = (await articleImages(id)).map((m, index) => ({
      clientId: "image-" + m.media_id + "-" + index,
      mediaId: Number(m.media_id),
      url: mediaUrl(m.path),
      alt: m.alt,
      caption: m.caption,
    }));
    return {
      status: "editable",
      article: {
        id: Number(a.id),
        slug: a.slug,
        title: a.title,
        category: a.category,
        body: a.body,
        images,
        revision: Number(a.revision),
      },
    };
  } catch {
    return { status: "unavailable" };
  }
}
