import { z } from "zod";

// Validated at the adapter boundary per docs/DATA_API_CONTRACTS.md. Field
// names mirror the WordPress REST API (consulted 2026-09-19):
// https://developer.wordpress.org/rest-api/reference/posts/
// https://developer.wordpress.org/rest-api/reference/media/
// https://developer.wordpress.org/rest-api/reference/categories/

export const wpRenderedFieldSchema = z.object({ rendered: z.string() });

export const wpCategorySchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
});
export const wpCategoryListSchema = z.array(wpCategorySchema);

export const wpMediaSchema = z.object({
  id: z.number(),
  source_url: z.url(),
  alt_text: z.string().optional().default(""),
  caption: wpRenderedFieldSchema.optional(),
});

export const wpPostSchema = z.object({
  id: z.number(),
  slug: z.string(),
  status: z.string(),
  date_gmt: z.string().nullable().optional(),
  title: wpRenderedFieldSchema,
  content: wpRenderedFieldSchema,
  excerpt: wpRenderedFieldSchema,
  categories: z.array(z.number()).optional().default([]),
  featured_media: z.number().optional().default(0),
});
export const wpPostListSchema = z.array(wpPostSchema);

export const wpCreatedPostSchema = z.object({
  id: z.number(),
  slug: z.string(),
  status: z.string(),
});

export const wpCreatedMediaSchema = z.object({
  id: z.number(),
  source_url: z.url(),
});
