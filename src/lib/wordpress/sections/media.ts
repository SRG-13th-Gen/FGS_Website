import "server-only";

import { isAbortError, wordpressAuthedFetch } from "@/lib/wordpress/client";
import { sniffImageMimeType } from "@/lib/wordpress/image-type";
import { wpCreatedMediaSchema } from "@/lib/wordpress/schemas";

const UPLOAD_TIMEOUT_MS = 20_000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export type SectionImageUploadResult = { mediaId: number } | { error: string };

/** Uploads a single section image (hero background, logo, gallery photo). */
export async function uploadSectionImage(
  file: File,
  altText: string,
): Promise<SectionImageUploadResult> {
  if (!file || file.size === 0) return { error: "No image file was provided." };
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: `${file.name || "Image"} is larger than 10 MB.` };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = sniffImageMimeType(bytes);
  if (!mimeType) {
    return {
      error: `${file.name || "Image"} is not a supported image type (JPEG, PNG, WebP, or AVIF).`,
    };
  }

  const filename = file.name || `section-image.${mimeType.split("/")[1]}`;
  const formData = new FormData();
  formData.set("file", new Blob([bytes], { type: mimeType }), filename);
  formData.set("alt_text", altText);

  let response: Response;
  try {
    response = await wordpressAuthedFetch("/media", {
      method: "POST",
      body: formData,
      timeoutMs: UPLOAD_TIMEOUT_MS,
    });
  } catch (error) {
    if (isAbortError(error)) {
      return { error: `Uploading ${filename} timed out. Try again.` };
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

  return { mediaId: parsed.data.id };
}
