import "server-only";

import { buildArticleContent } from "@/lib/wordpress/blocks";
import { resolveArticleCategoryIds } from "@/lib/wordpress/categories";
import { isAbortError, wordpressAuthedFetch } from "@/lib/wordpress/client";
import { uploadOrReuseImage } from "@/lib/wordpress/article-images";
import { wpCreatedPostSchema } from "@/lib/wordpress/schemas";
import type {
  PublishArticleInput,
  PublishArticleResult,
  UploadedImageRef,
} from "@/lib/wordpress/types";
import {
  MAX_IMAGES_PER_ARTICLE,
  validateArticleFields,
  validateImageFile,
} from "@/lib/wordpress/validation";

const POST_UPDATE_TIMEOUT_MS = 15_000;
const POST_TRASH_TIMEOUT_MS = 15_000;

export interface UpdateArticleInput extends PublishArticleInput {
  postId: number;
}

/**
 * Same validation/upload/content-building pipeline as publishArticle()
 * (src/lib/wordpress/publish.ts) — reused via article-images.ts — but PATCHes
 * an existing post instead of creating one. An `images[]` entry that keeps
 * its `existingMediaId` and carries no new `file` is never re-uploaded;
 * uploadOrReuseImage() just re-confirms it still exists. `images[0]` is
 * always the featured/cover image and `images[1..]` become body image
 * blocks, in that order — the same model getArticleForEdit() reads the
 * article into, so an unmodified save reproduces equivalent content.
 */
export async function updateArticle(
  input: UpdateArticleInput,
): Promise<PublishArticleResult> {
  if (input.images.length > MAX_IMAGES_PER_ARTICLE) {
    return {
      status: "validation_error",
      fieldErrors: {
        images: `A maximum of ${MAX_IMAGES_PER_ARTICLE} images is supported per article.`,
      },
      uploadedImages: [],
    };
  }

  const { data: fields, fieldErrors } = validateArticleFields(input);

  for (const image of input.images) {
    if (image.existingMediaId) continue;
    const error = await validateImageFile(image.clientId, image.file);
    if (error && !fieldErrors.images) {
      fieldErrors.images = error.message;
    }
  }

  if (!fields || Object.keys(fieldErrors).length > 0) {
    return { status: "validation_error", fieldErrors, uploadedImages: [] };
  }

  const categoryIds = await resolveArticleCategoryIds();
  const categoryId = categoryIds?.[fields.category];
  if (!categoryId) {
    return {
      status: "error",
      message:
        "Could not resolve the WordPress category for this article. Check the local CMS setup.",
      uploadedImages: [],
    };
  }

  const uploadedImages: UploadedImageRef[] = [];
  for (const image of input.images) {
    const outcome = await uploadOrReuseImage(image, fields.title);
    if ("error" in outcome) {
      return { status: "error", message: outcome.error, uploadedImages };
    }
    uploadedImages.push(outcome.ref);
  }

  // Same cover/body split as publishArticle(): the first image is the
  // featured image, shown separately — never duplicated inline.
  const blockImages = input.images.slice(1).map((image, index) => ({
    url: uploadedImages[index + 1].url,
    mediaId: uploadedImages[index + 1].mediaId,
    alt: image.altText.trim() || image.caption.trim() || fields.title,
    caption: image.caption.trim(),
  }));

  const contentHtml = buildArticleContent(fields.body, blockImages);
  // 0 explicitly clears the featured image when every photo was removed.
  const featuredMediaId = uploadedImages[0]?.mediaId ?? 0;

  let response: Response;
  try {
    response = await wordpressAuthedFetch(`/posts/${input.postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fields.title,
        content: contentHtml,
        categories: [categoryId],
        featured_media: featuredMediaId,
      }),
      timeoutMs: POST_UPDATE_TIMEOUT_MS,
    });
  } catch (error) {
    if (isAbortError(error)) {
      return {
        status: "uncertain",
        message:
          "Saving timed out. WordPress may have still saved the change — reload before retrying.",
        uploadedImages,
      };
    }
    return {
      status: "error",
      message: "Could not reach WordPress to save this article.",
      uploadedImages,
    };
  }

  if (!response.ok) {
    return {
      status: "error",
      message: "WordPress rejected the change.",
      uploadedImages,
    };
  }

  const parsed = wpCreatedPostSchema.safeParse(await response.json());
  if (!parsed.success) {
    return {
      status: "uncertain",
      message:
        "WordPress returned an unexpected response after saving. Reload before retrying.",
      uploadedImages,
    };
  }

  return {
    status: "success",
    slug: parsed.data.slug,
    articlePath: `/news/${parsed.data.slug}`,
    cacheWarning: false,
    uploadedImages,
  };
}

export type TrashArticleResult =
  | { status: "success" }
  | { status: "not-found" }
  | { status: "error"; message: string }
  | { status: "uncertain"; message: string };

/**
 * Moves a post to WordPress's trash — DELETE without `force=true` per the
 * REST API reference (never permanent deletion; DEC-111/SPEC-003 owner
 * instruction). A trashed post keeps its data for WordPress's normal trash
 * retention and can be restored natively.
 */
export async function trashArticle(
  postId: number,
): Promise<TrashArticleResult> {
  let response: Response;
  try {
    response = await wordpressAuthedFetch(`/posts/${postId}`, {
      method: "DELETE",
      timeoutMs: POST_TRASH_TIMEOUT_MS,
    });
  } catch (error) {
    if (isAbortError(error)) {
      return {
        status: "uncertain",
        message:
          "Moving this article to trash timed out. Check wp-admin before retrying.",
      };
    }
    return {
      status: "error",
      message: "Could not reach WordPress to trash this article.",
    };
  }

  if (response.status === 404) return { status: "not-found" };
  if (!response.ok) {
    return {
      status: "error",
      message: "WordPress rejected the request to trash this article.",
    };
  }

  return { status: "success" };
}
