import "server-only";
import { mutate } from "./db";
import { saveArticle } from "./publish";
import type { PublishArticleInput, PublishArticleResult } from "./types";
export interface UpdateArticleInput extends PublishArticleInput {
  postId: number;
  expectedRevision: number;
}
export async function updateArticle(
  input: UpdateArticleInput,
): Promise<PublishArticleResult> {
  return saveArticle(input, {
    postId: input.postId,
    expectedRevision: input.expectedRevision,
  });
}
export type TrashArticleResult =
  | { status: "success" }
  | { status: "not-found" }
  | { status: "error"; message: string }
  | { status: "uncertain"; message: string };
export async function trashArticle(
  postId: number,
): Promise<TrashArticleResult> {
  if (!Number.isSafeInteger(postId) || postId < 1)
    return { status: "not-found" };
  try {
    const result = await mutate(
      "UPDATE articles SET status = 'trash', revision = revision + 1, modified_at = UTC_TIMESTAMP(3) WHERE id = ? AND status <> 'trash'",
      [postId],
    );
    return result.affectedRows
      ? { status: "success" }
      : { status: "not-found" };
  } catch {
    return {
      status: "uncertain",
      message:
        "The result could not be confirmed. Reload the article list before retrying.",
    };
  }
}
