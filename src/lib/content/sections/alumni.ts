import { z } from "zod";

import { imageRefSchema, type ResolvedImage } from "./types";

/** Optional photo; alt text is required whenever a photo is set. */
const achievementImageSchema = imageRefSchema.extend({
  alt: z
    .string()
    .trim()
    .min(1, "Alt text is required when a photo is set.")
    .max(200),
});

const achievementSchema = z.object({
  name: z.string().trim().min(1).max(100),
  /** Free text such as "Batch 2015" or "Class of 2015"; no year validation. */
  batch: z.string().trim().min(1).max(40),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(400),
  image: achievementImageSchema.optional(),
});

export const alumniSchema = z.object({
  sectionLabel: z.string().trim().min(1).max(60),
  heading: z.string().trim().min(3).max(150),
  intro: z.string().trim().max(400),
  /** May be empty: the public page shows a truthful empty state. */
  achievements: z.array(achievementSchema).max(24),
});
export type AlumniContent = z.infer<typeof alumniSchema>;
export type AlumniAchievement = z.infer<typeof achievementSchema>;

export interface AlumniAchievementView extends Omit<
  AlumniAchievement,
  "image"
> {
  image: ResolvedImage | null;
}
export interface AlumniView extends Omit<AlumniContent, "achievements"> {
  achievements: AlumniAchievementView[];
}

/** No people are invented: the empty list is the honest default. */
export const ALUMNI_DEFAULTS: AlumniContent = {
  sectionLabel: "Alumni",
  heading: "Alumni Achievements",
  intro: "Celebrating the accomplishments of Flor de Grace School alumni.",
  achievements: [],
};

export const ALUMNI_FALLBACK: AlumniView = {
  ...ALUMNI_DEFAULTS,
  achievements: [],
};

export type AlumniResult =
  { status: "ok"; alumni: AlumniView } | { status: "unavailable" };
