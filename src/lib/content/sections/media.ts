import "server-only";
import { uploadMedia } from "../media";
export type SectionImageUploadResult = { mediaId: number } | { error: string };
export async function uploadSectionImage(
  file: File,
  altText: string,
): Promise<SectionImageUploadResult> {
  try {
    return await uploadMedia(file, altText);
  } catch {
    return {
      error:
        "The image could not be saved. Choose a supported image up to 10 MB and try again.",
    };
  }
}
