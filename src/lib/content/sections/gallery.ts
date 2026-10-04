import { z } from "zod";

import { imageRefSchema, type ResolvedImage } from "./types";

const photoSchema = z.object({
  image: imageRefSchema,
  caption: z.string().trim().max(150).optional().default(""),
});

export const gallerySchema = z.object({
  sectionLabel: z.string().trim().min(1).max(60),
  heading: z.string().trim().min(3).max(150),
  intro: z.string().trim().max(400),
  /** Shown 5 at a time (1 large + 4 grid), revealed in further sets of 5 via "View More". */
  photos: z.array(photoSchema).max(30),
});
export type GalleryContent = z.infer<typeof gallerySchema>;
export type GalleryPhoto = z.infer<typeof photoSchema>;

export interface GalleryPhotoView {
  image: ResolvedImage;
  caption: string;
}
export interface GalleryView extends Omit<GalleryContent, "photos"> {
  photos: GalleryPhotoView[];
}

export const GALLERY_DEFAULTS: GalleryContent = {
  sectionLabel: "Gallery",
  heading: "Life at FGS",
  intro:
    "A glimpse into the vibrant school life and memorable moments at Flor de Grace School.",
  photos: [],
};

/** No bundled placeholder photos exist yet — the empty state is the honest default. */
export const GALLERY_FALLBACK: GalleryView = {
  ...GALLERY_DEFAULTS,
  photos: [],
};
