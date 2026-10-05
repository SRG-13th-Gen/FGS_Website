import { z } from "zod";

/** Stored shape: only a media ID + alt text — never a hand-typed URL. */
export const imageRefSchema = z.object({
  mediaId: z.number().int().positive(),
  alt: z.string(),
});
export type ImageRef = z.infer<typeof imageRefSchema>;

/** Read-time shape: the stored ref plus its resolved media URL, or null if the media is gone. */
export interface ResolvedImage {
  mediaId: number;
  url: string;
  alt: string;
}

export const SECTION_SLUGS = [
  "site-hero",
  "site-school-info",
  "site-about",
  "site-admission",
  "site-contact",
  "site-clubs",
  "site-gallery",
  "site-alumni",
] as const;
export type SectionSlug = (typeof SECTION_SLUGS)[number];

export interface SectionSaveOk {
  status: "success";
  cacheWarning: boolean;
  revision: number;
  /**
   * Slot index -> stored media id, for images uploaded by this save. Lets the
   * form hold the saved reference instead of the original file, so a later
   * save never uploads the same file again.
   */
  uploadedMedia?: Record<number, number>;
}
export interface SectionSaveValidationError {
  status: "validation_error";
  fieldErrors: Record<string, string>;
}
export interface SectionSaveError {
  status: "error";
  message: string;
}
export interface SectionSaveUncertain {
  status: "uncertain";
  message: string;
}
export type SectionSaveResult =
  | SectionSaveOk
  | SectionSaveValidationError
  | SectionSaveError
  | SectionSaveUncertain;
