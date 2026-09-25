import "server-only";

import { isAbortError, wordpressAuthedFetch } from "@/lib/wordpress/client";
import { sniffImageMimeType } from "@/lib/wordpress/image-type";
import { wpCreatedMediaSchema } from "@/lib/wordpress/schemas";
import type {
  ArticleImageInput,
  UploadedImageRef,
} from "@/lib/wordpress/types";

const UPLOAD_TIMEOUT_MS = 20_000;

export type ImageOutcome = { ref: UploadedImageRef } | { error: string };

/** Re-confirms a media item uploaded during a prior attempt, instead of re-uploading it. */
export async function reuseExistingImage(
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

export async function uploadNewImage(
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

/** Uploads a new image, or re-confirms one already uploaded in a prior attempt. */
export async function uploadOrReuseImage(
  image: ArticleImageInput,
  fallbackAlt: string,
): Promise<ImageOutcome> {
  if (image.existingMediaId) {
    return reuseExistingImage(image.clientId, image.existingMediaId);
  }
  return uploadNewImage(image, fallbackAlt);
}
