import "server-only";

import { buildArticleContent } from "@/lib/wordpress/blocks";
import { resolveArticleCategoryIds } from "@/lib/wordpress/categories";
import { isAbortError, wordpressAuthedFetch } from "@/lib/wordpress/client";
import { sniffImageMimeType } from "@/lib/wordpress/image-type";
import {
  wpCreatedMediaSchema,
  wpCreatedPostSchema,
} from "@/lib/wordpress/schemas";
import type {
  ArticleImageInput,
  PublishArticleInput,
  PublishArticleResult,
  UploadedImageRef,
} from "@/lib/wordpress/types";
import {
  MAX_IMAGES_PER_ARTICLE,
  validateArticleFields,
  validateImageFile,
} from "@/lib/wordpress/validation";

const UPLOAD_TIMEOUT_MS = 20_000;
const POST_CREATE_TIMEOUT_MS = 15_000;

type ImageOutcome = { ref: UploadedImageRef } | { error: string };

/** Re-confirms a media item uploaded during a prior attempt, instead of re-uploading it. */
async function reuseExistingImage(
  clientId: string,
  mediaId: number,
): Promise<ImageOutcome> {
  let response: Response;
  try {
    response = await wordpressAuthedFetch(`/media/${mediaId}`, {
      method: "GET",
      timeoutMs: UPLOAD_TIMEOUT_MS,
    });
  } catch (error) {
    if (isAbortError(error)) {
      return {
        error: "Confirming a previously uploaded image timed out. Try again.",
      };
    }
    return {
      error:
        "Could not reach WordPress to confirm a previously uploaded image.",
    };
  }

  if (!response.ok) {
    return {
      error:
        "A previously uploaded image could no longer be found in WordPress.",
    };
  }

  const parsed = wpCreatedMediaSchema.safeParse(await response.json());
  if (!parsed.success) {
    return {
      error:
        "Unexpected response while confirming a previously uploaded image.",
    };
  }

  return {
    ref: { clientId, mediaId: parsed.data.id, url: parsed.data.source_url },
  };
}

async function uploadNewImage(
  image: ArticleImageInput,
  fallbackAlt: string,
): Promise<ImageOutcome> {
  const bytes = new Uint8Array(await image.file.arrayBuffer());
  const mimeType = sniffImageMimeType(bytes);
  if (!mimeType) {
    return {
      error: `${image.file.name || "Image"} is not a supported image type.`,
    };
  }

  const altText = image.altText.trim() || image.caption.trim() || fallbackAlt;
  const filename = image.file.name || `article-image.${mimeType.split("/")[1]}`;

  const formData = new FormData();
  formData.set("file", new Blob([bytes], { type: mimeType }), filename);
  formData.set("alt_text", altText);
  formData.set("caption", image.caption.trim());

  let response: Response;
  try {
    response = await wordpressAuthedFetch("/media", {
      method: "POST",
      body: formData,
      timeoutMs: UPLOAD_TIMEOUT_MS,
    });
  } catch (error) {
    if (isAbortError(error)) {
      return {
        error: `Uploading ${filename} timed out. Try again — already-uploaded images will not be re-uploaded.`,
      };
    }
    return { error: `Could not reach WordPress to upload ${filename}.` };
  }

  if (!response.ok) {
    return { error: `WordPress rejected the upload for ${filename}.` };
  }

  const parsed = wpCreatedMediaSchema.safeParse(await response.json());
  if (!parsed.success) {
    return {
      error: `Unexpected response from WordPress while uploading ${filename}.`,
    };
  }

  return {
    ref: {
      clientId: image.clientId,
      mediaId: parsed.data.id,
      url: parsed.data.source_url,
    },
  };
}

async function uploadOrReuseImage(
  image: ArticleImageInput,
  fallbackAlt: string,
): Promise<ImageOutcome> {
  if (image.existingMediaId) {
    return reuseExistingImage(image.clientId, image.existingMediaId);
  }
  return uploadNewImage(image, fallbackAlt);
}

/**
 * Validates input, uploads images (skipping ones already uploaded in a prior
 * attempt), and creates the WordPress post. No Next.js-specific APIs here —
 * see src/app/admin/(protected)/publish-actions.ts for requireAdmin() and
 * cache revalidation around this.
 */
export async function publishArticle(
  input: PublishArticleInput,
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

  // The first image is the cover/featured image, already shown separately
  // above the article body — don't also embed it inline as a body block.
  const blockImages = input.images.slice(1).map((image, index) => ({
    url: uploadedImages[index + 1].url,
    mediaId: uploadedImages[index + 1].mediaId,
    alt: image.altText.trim() || image.caption.trim() || fields.title,
    caption: image.caption.trim(),
  }));

  const contentHtml = buildArticleContent(fields.body, blockImages);
  const featuredMediaId = uploadedImages[0]?.mediaId ?? 0;

  let response: Response;
  try {
    response = await wordpressAuthedFetch("/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fields.title,
        status: "publish",
        content: contentHtml,
        categories: [categoryId],
        featured_media: featuredMediaId,
      }),
      timeoutMs: POST_CREATE_TIMEOUT_MS,
    });
  } catch (error) {
    if (isAbortError(error)) {
      return {
        status: "uncertain",
        message:
          "Publishing timed out. WordPress may have still created the post — check wp-admin before retrying to avoid a duplicate.",
        uploadedImages,
      };
    }
    return {
      status: "error",
      message: "Could not reach WordPress to publish the article.",
      uploadedImages,
    };
  }

  if (!response.ok) {
    return {
      status: "error",
      message: "WordPress rejected the new article.",
      uploadedImages,
    };
  }

  const parsed = wpCreatedPostSchema.safeParse(await response.json());
  if (!parsed.success) {
    return {
      status: "uncertain",
      message:
        "WordPress returned an unexpected response after publishing. Check wp-admin before retrying to avoid a duplicate.",
      uploadedImages,
    };
  }

  return {
    status: "success",
    slug: parsed.data.slug,
    articlePath: `/news/${parsed.data.slug}`,
    cacheWarning: false,
  };
}
