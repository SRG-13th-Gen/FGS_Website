"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { updateArticle } from "@/lib/wordpress/edit-article";
import type {
  ArticleImageInput,
  PublishArticleInput,
  PublishArticleResult,
} from "@/lib/wordpress/types";

function parseExistingMediaId(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseImages(formData: FormData): ArticleImageInput[] {
  const ids = String(formData.get("imageIds") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  return ids.map((clientId) => {
    const file = formData.get(`image-file-${clientId}`);
    return {
      clientId,
      file: file instanceof File ? file : new File([], ""),
      caption: String(formData.get(`image-caption-${clientId}`) ?? ""),
      altText: String(formData.get(`image-alt-${clientId}`) ?? ""),
      existingMediaId: parseExistingMediaId(
        formData.get(`image-existingId-${clientId}`),
      ),
    };
  });
}

export async function updateArticleAction(
  postId: number,
  _prevState: PublishArticleResult | null,
  formData: FormData,
): Promise<PublishArticleResult> {
  await requireAdmin();

  const input: PublishArticleInput = {
    title: String(formData.get("title") ?? ""),
    category: String(formData.get("category") ?? ""),
    body: String(formData.get("body") ?? ""),
    images: parseImages(formData),
  };

  const result = await updateArticle({ ...input, postId });
  if (result.status !== "success") {
    return result;
  }

  let cacheWarning = false;
  try {
    revalidatePath("/");
    revalidatePath(result.articlePath);
    revalidatePath(`/admin/articles/${postId}/edit`);
  } catch {
    cacheWarning = true;
  }

  return { ...result, cacheWarning };
}
