import { z } from "zod";

import { sniffImageMimeType } from "@/lib/wordpress/image-type";
import { ARTICLE_CATEGORIES } from "@/lib/wordpress/types";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
// Practical bound so the server action body size limit (next.config.ts) stays
// finite. Not part of the base SPEC-003 acceptance criteria.
export const MAX_IMAGES_PER_ARTICLE = 6;

const articleFieldsSchema = z.object({
  title: z.string().trim().min(3).max(200),
  category: z.enum(ARTICLE_CATEGORIES),
  body: z.string().trim().min(1),
});

export type ArticleFieldInput = z.infer<typeof articleFieldsSchema>;
export type ArticleFieldErrors = Partial<
  Record<"title" | "category" | "body" | "images", string>
>;

export function validateArticleFields(input: {
  title: string;
  category: string;
  body: string;
}): { data: ArticleFieldInput | null; fieldErrors: ArticleFieldErrors } {
  const result = articleFieldsSchema.safeParse(input);
  if (result.success) return { data: result.data, fieldErrors: {} };

  const fieldErrors: ArticleFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field === "title" && !fieldErrors.title) {
      fieldErrors.title = "Title must be between 3 and 200 characters.";
    } else if (field === "category" && !fieldErrors.category) {
      fieldErrors.category = "Choose a valid category.";
    } else if (field === "body" && !fieldErrors.body) {
      fieldErrors.body = "Article body is required.";
    }
  }
  return { data: null, fieldErrors };
}

export interface ImageValidationError {
  clientId: string;
  message: string;
}

/** Checks size and sniffs real file content — never trusts the extension or browser MIME type. */
export async function validateImageFile(
  clientId: string,
  file: File,
): Promise<ImageValidationError | null> {
  if (!file || file.size === 0) {
    return { clientId, message: "Image file is empty or missing." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      clientId,
      message: `${file.name || "Image"} is larger than 10 MB.`,
    };
  }

  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const mimeType = sniffImageMimeType(head);
  if (!mimeType) {
    return {
      clientId,
      message: `${file.name || "Image"} is not a supported image type (JPEG, PNG, WebP, or AVIF).`,
    };
  }

  return null;
}
