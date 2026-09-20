// App-owned DTOs. Deliberately distinct from WordPress wire field names
// (see docs/DATA_API_CONTRACTS.md) so the adapter boundary stays explicit.

export const ARTICLE_CATEGORIES = ["announcements", "events", "clubs"] as const;
export type ArticleCategorySlug = (typeof ARTICLE_CATEGORIES)[number];

export interface ArticleImage {
  url: string;
  alt: string;
  caption: string | null;
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  category: ArticleCategorySlug;
  /** ISO 8601 UTC, or null when WordPress has no date set. */
  publishedAt: string | null;
  /** Plain text, HTML-stripped. */
  excerpt: string;
  /** Sanitized HTML; safe to render via dangerouslySetInnerHTML. */
  contentHtml: string;
  coverImage: ArticleImage | null;
}

export type ArticleListResult =
  { status: "ok"; articles: Article[] } | { status: "unavailable" };

export type ArticleDetailResult =
  | { status: "ok"; article: Article }
  | { status: "not-found" }
  | { status: "unavailable" };

export interface UploadedImageRef {
  clientId: string;
  mediaId: number;
  url: string;
}

export interface ArticleImageInput {
  clientId: string;
  file: File;
  caption: string;
  altText: string;
  /** Set when a prior attempt already uploaded this slot; skips re-upload. */
  existingMediaId: number | null;
}

export interface PublishArticleInput {
  title: string;
  category: string;
  body: string;
  images: ArticleImageInput[];
}

export type PublishArticleResult =
  | {
      status: "success";
      slug: string;
      articlePath: string;
      cacheWarning: boolean;
    }
  | {
      status: "validation_error";
      fieldErrors: Partial<
        Record<"title" | "category" | "body" | "images", string>
      >;
      uploadedImages: UploadedImageRef[];
    }
  | {
      status: "error";
      message: string;
      uploadedImages: UploadedImageRef[];
    }
  | {
      status: "uncertain";
      message: string;
      uploadedImages: UploadedImageRef[];
    };
