import "server-only";
import { getMedia, uploadMedia } from "./media";
import type { ArticleImageInput, UploadedImageRef } from "./types";
export type ImageOutcome = { ref: UploadedImageRef } | { error: string };
export async function reuseExistingImage(
  clientId: string,
  mediaId: number,
): Promise<ImageOutcome> {
  try {
    const media = await getMedia(mediaId);
    if (!media || !String(media.mime_type).startsWith("image/"))
      return { error: "A selected image is no longer available." };
    return { ref: { clientId, mediaId: media.id, url: media.url } };
  } catch {
    return { error: "The selected image could not be confirmed. Try again." };
  }
}
export async function uploadNewImage(
  image: ArticleImageInput,
  fallbackAlt: string,
): Promise<ImageOutcome> {
  try {
    const item = await uploadMedia(
      image.file,
      image.altText.trim() || image.caption.trim() || fallbackAlt,
      image.caption.trim(),
    );
    return { ref: { clientId: image.clientId, ...item } };
  } catch {
    return {
      error:
        "The image could not be saved. Check its type and size and try again.",
    };
  }
}
export async function uploadOrReuseImage(
  image: ArticleImageInput,
  fallbackAlt: string,
): Promise<ImageOutcome> {
  return image.existingMediaId
    ? reuseExistingImage(image.clientId, image.existingMediaId)
    : uploadNewImage(image, fallbackAlt);
}
