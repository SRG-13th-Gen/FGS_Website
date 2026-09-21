"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  trashArticle,
  type TrashArticleResult,
} from "@/lib/wordpress/edit-article";

export type TrashArticleActionResult =
  | { status: "success"; cacheWarning: boolean }
  | { status: "not-found" }
  | { status: "error"; message: string }
  | { status: "uncertain"; message: string };

export async function trashArticleAction(
  postId: number,
  articlePath: string,
): Promise<TrashArticleActionResult> {
  await requireAdmin();

  const result: TrashArticleResult = await trashArticle(postId);
  if (result.status !== "success") return result;

  let cacheWarning = false;
  try {
    revalidatePath("/");
    revalidatePath("/admin/articles");
    revalidatePath(articlePath);
  } catch {
    cacheWarning = true;
  }

  return { status: "success", cacheWarning };
}
