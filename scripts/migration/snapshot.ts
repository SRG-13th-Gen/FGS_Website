import { z } from "zod";
const text = z
  .object({ raw: z.string().optional(), rendered: z.string() })
  .passthrough();
export const resourceSchema = z
  .object({
    id: z.number().int().positive(),
    slug: z.string(),
    status: z.string().optional(),
    link: z.string(),
    date_gmt: z.string().optional(),
    modified_gmt: z.string().optional(),
    title: text,
    content: text.optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
    featured_media: z.number().optional(),
    source_url: z.string().optional(),
    mime_type: z.string().optional(),
    alt_text: z.string().optional(),
    caption: text.optional(),
    media_details: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();
export const snapshotSchema = z.object({
  version: z.literal(1),
  createdAt: z.string(),
  origins: z.array(z.string()),
  posts: z.array(resourceSchema),
  pages: z.array(resourceSchema),
  media: z.array(resourceSchema),
  sourceInventories: z.array(
    z.object({
      origin: z.string(),
      posts: z.number(),
      pages: z.number(),
      media: z.number(),
    }),
  ),
  files: z.array(
    z.object({
      url: z.string(),
      path: z.string(),
      checksum: z.string().length(64),
      bytes: z.number().nonnegative(),
      mime: z.string(),
    }),
  ),
});
export type MigrationSnapshot = z.infer<typeof snapshotSchema>;
