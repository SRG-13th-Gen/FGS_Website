import { z } from "zod";

import { imageRefSchema, type ResolvedImage } from "./types";

export const heroSchema = z.object({
  /** Rendered as separate lines on blank-line-free newlines, like the article body soft-break. */
  heading: z.string().trim().min(3).max(200),
  tagline: z.string().trim().max(300),
  backgroundImage: imageRefSchema,
});
export type HeroContent = z.infer<typeof heroSchema>;

export interface HeroView {
  heading: string;
  tagline: string;
  backgroundImage: ResolvedImage;
}

export const HERO_DEFAULTS: HeroContent = {
  heading: "Welcome to\nFlor de Grace School Inc.",
  tagline: "“Where Excellence Blooms and Futures Begin.”",
  backgroundImage: {
    mediaId: 0,
    alt: "Flor de Grace School graduation ceremony",
  },
};

/** Used when WordPress is unreachable, the section is unseeded, or its image was deleted. */
export const HERO_FALLBACK: HeroView = {
  heading: HERO_DEFAULTS.heading,
  tagline: HERO_DEFAULTS.tagline,
  backgroundImage: {
    mediaId: 0,
    url: "/images/hero/fgs-website-e1760252687123.png",
    alt: HERO_DEFAULTS.backgroundImage.alt,
  },
};
