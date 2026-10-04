import { z } from "zod";

import { sniffImageMimeType } from "@/lib/content/image-type";
import { ARTICLE_CATEGORIES } from "@/lib/content/types";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
// Owner-approved migration limits fit the 65 MB server-action ceiling.
export const MAX_IMAGES_PER_ARTICLE = 20;
export const MAX_ARTICLE_UPLOAD_BYTES = 60 * 1024 * 1024;

const articleFieldsSchema = z.object({
  title: z.string().trim().min(3).max(200),
  category: z.enum(ARTICLE_CATEGORIES),
  body: z.string().trim().max(200000),
});

export type ArticleFieldInput = z.infer<typeof articleFieldsSchema>;
export type ArticleFieldErrors = Partial<
  Record<"title" | "category" | "body" | "images", string>
>;

export function validateArticleFields(input: {
  title: string;
  category: string;
  body: string;
  imageCount?: number;
}): { data: ArticleFieldInput | null; fieldErrors: ArticleFieldErrors } {
  const result = articleFieldsSchema.safeParse(input);
  if (result.success) {
    if (!result.data.body && !input.imageCount)
      return {
        data: null,
        fieldErrors: { body: "Add article text or at least one photo." },
      };
    return { data: result.data, fieldErrors: {} };
  }

  const fieldErrors: ArticleFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field === "title" && !fieldErrors.title) {
      fieldErrors.title = "Title must be between 3 and 200 characters.";
    } else if (field === "category" && !fieldErrors.category) {
      fieldErrors.category = "Choose a valid category.";
    } else if (field === "body" && !fieldErrors.body) {
      fieldErrors.body = "Article text must be 200,000 characters or fewer.";
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
