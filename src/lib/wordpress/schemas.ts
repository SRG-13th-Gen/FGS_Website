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

// Admin list queries request a narrower `_fields` set (no content/excerpt —
// unused there), so they need their own schema rather than the full
// wpPostSchema, which requires those fields.
export const wpPostSummarySchema = z.object({
  id: z.number(),
  slug: z.string(),
  status: z.string(),
  date_gmt: z.string().nullable().optional(),
  title: wpRenderedFieldSchema,
  categories: z.array(z.number()).optional().default([]),
  featured_media: z.number().optional().default(0),
});
export const wpPostSummaryListSchema = z.array(wpPostSummarySchema);

// `context=edit` additionally exposes the unrendered `raw` sub-field for
// protected fields (title/content) to a user with edit capability — needed
// to inspect the actual Gutenberg block markup, since `rendered` returns
// already-rendered HTML with block comments stripped.
export const wpRawFieldSchema = z.object({
  raw: z.string(),
  rendered: z.string(),
});
export const wpPostEditSchema = z.object({
  id: z.number(),
  slug: z.string(),
  status: z.string(),
  date_gmt: z.string().nullable().optional(),
  title: wpRawFieldSchema,
  content: wpRawFieldSchema,
  categories: z.array(z.number()).optional().default([]),
  featured_media: z.number().optional().default(0),
});

export const wpCreatedPostSchema = z.object({
  id: z.number(),
  slug: z.string(),
  status: z.string(),
});

export const wpCreatedMediaSchema = z.object({
  id: z.number(),
  source_url: z.url(),
});
