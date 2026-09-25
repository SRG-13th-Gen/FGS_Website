import { z } from "zod";

import { SECTION_SLUGS } from "@/lib/wordpress/sections/types";

const slug = z.string().regex(/^[a-z0-9][a-z0-9-]{0,199}$/);

export const revalidationEventSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("post"),
    id: z.number().int().positive(),
    oldSlug: slug.optional(),
    newSlug: slug.optional(),
  }),
  z.object({
    kind: z.literal("page"),
    id: z.number().int().positive(),
    oldSlug: z.enum(SECTION_SLUGS).optional(),
    newSlug: z.enum(SECTION_SLUGS).optional(),
  }),
  z.object({ kind: z.literal("category"), id: z.number().int().positive() }),
  z.object({ kind: z.literal("media"), id: z.number().int().positive() }),
]);

export type RevalidationEvent = z.infer<typeof revalidationEventSchema>;

export function affectedPaths(event: RevalidationEvent): string[] {
  const paths = new Set(["/"]);
  if (event.kind === "post") {
    if (event.oldSlug) paths.add(`/news/${event.oldSlug}`);
    if (event.newSlug) paths.add(`/news/${event.newSlug}`);
  }
  if (
    event.kind === "page" &&
    (event.oldSlug === "site-school-info" ||
      event.newSlug === "site-school-info")
  ) {
    paths.add("/news/[slug]");
  }
  if (event.kind === "media") paths.add("/news/[slug]");
  return [...paths];
}

export function affectedTags(event: RevalidationEvent): string[] {
  if (event.kind === "category") return ["wp:categories", "wp:articles"];
  if (event.kind === "page") return ["wp:sections"];
  if (event.kind === "media") return ["wp:sections", "wp:articles"];
  return ["wp:articles"];
}
