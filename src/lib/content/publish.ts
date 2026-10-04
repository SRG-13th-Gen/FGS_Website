import "server-only";
import { rows, mutate, transaction } from "./db";
import { uploadOrReuseImage } from "./article-images";
import {
  validateArticleFields,
  validateImageFile,
  MAX_IMAGES_PER_ARTICLE,
  MAX_ARTICLE_UPLOAD_BYTES,
} from "./validation";
import type {
  PublishArticleInput,
  PublishArticleResult,
  UploadedImageRef,
} from "./types";
import type { PoolConnection } from "mysql2/promise";
export class RevisionConflict extends Error {}
function slugBase(title: string): string {
  return (
    title
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 160) || "school-news"
  );
}
export async function writeArticleImages(
  connection: PoolConnection,
  id: number,
  input: PublishArticleInput,
  uploaded: UploadedImageRef[],
) {
  await mutate(
    "DELETE FROM article_images WHERE article_id = ?",
    [id],
    connection,
  );
  for (let index = 0; index < uploaded.length; index++) {
    await mutate(
      "INSERT INTO article_images (article_id, position, media_id, alt, caption) VALUES (?, ?, ?, ?, ?)",
      [
        id,
        index,
        uploaded[index].mediaId,
        input.images[index].altText.trim() ||
          input.images[index].caption.trim() ||
          input.title.trim(),
        input.images[index].caption.trim(),
      ],
      connection,
    );
  }
}
export async function saveArticle(
  input: PublishArticleInput,
  update?: { postId: number; expectedRevision: number },
): Promise<PublishArticleResult> {
  const uploadedImages: UploadedImageRef[] = [];
  const { data: fields, fieldErrors } = validateArticleFields({
    ...input,
    imageCount: input.images.length,
  });
  if (input.images.length > MAX_IMAGES_PER_ARTICLE)
    fieldErrors.images =
      "A maximum of " +
      MAX_IMAGES_PER_ARTICLE +
      " images is supported per article.";
  const totalBytes = input.images.reduce(
    (sum, image) => sum + (image.existingMediaId ? 0 : image.file.size),
    0,
  );
  if (totalBytes > MAX_ARTICLE_UPLOAD_BYTES)
    fieldErrors.images = "New images must total no more than 60 MB.";
  for (const image of input.images) {
    if (image.existingMediaId) {
      if (
        !Number.isSafeInteger(image.existingMediaId) ||
        image.existingMediaId < 1
      )
        fieldErrors.images = "Choose a valid media item.";
    } else {
      const error = await validateImageFile(image.clientId, image.file);
      if (error) fieldErrors.images = error.message;
    }
    if (image.altText.length > 2000 || image.caption.length > 5000)
      fieldErrors.images = "Photo descriptions are too long.";
  }
  if (!update && !/^[a-f0-9-]{36}$/i.test(input.mutationKey ?? ""))
    fieldErrors.body = "Reload this page before publishing.";
  if (!fields || Object.keys(fieldErrors).length)
    return { status: "validation_error", fieldErrors, uploadedImages };
  if (
    update &&
    (!Number.isSafeInteger(update.postId) ||
      update.postId < 1 ||
      !Number.isSafeInteger(update.expectedRevision) ||
      update.expectedRevision < 1)
  )
    return {
      status: "error",
      message: "Reload this article before saving.",
      uploadedImages,
    };
  try {
    if (!update) {
      const [previous] = await rows(
        "SELECT slug, revision FROM articles WHERE mutation_key = ?",
        [input.mutationKey ?? null],
      );
      if (previous)
        return {
          status: "success",
          slug: previous.slug,
          articlePath: "/news/" + previous.slug,
          revision: Number(previous.revision),
          cacheWarning: false,
          uploadedImages,
        };
    } else {
      const [current] = await rows(
        "SELECT revision FROM articles WHERE id = ? AND status <> 'trash'",
        [update.postId],
      );
      if (!current || Number(current.revision) !== update.expectedRevision)
        return {
          status: "error",
          message:
            "This article changed since you opened it. Reload to review the latest version.",
          uploadedImages,
        };
    }
    for (const image of input.images) {
      const result = await uploadOrReuseImage(image, fields.title);
      if ("error" in result)
        return { status: "error", message: result.error, uploadedImages };
      uploadedImages.push(result.ref);
    }
    const result = await transaction(async (connection) => {
      if (update) {
        const saved = await mutate(
          "UPDATE articles SET title = ?, category = ?, body = ?, revision = revision + 1, modified_at = UTC_TIMESTAMP(3) WHERE id = ? AND revision = ? AND status <> 'trash'",
          [
            fields.title,
            fields.category,
            fields.body,
            update.postId,
            update.expectedRevision,
          ],
          connection,
        );
        if (!saved.affectedRows) throw new RevisionConflict();
        await writeArticleImages(
          connection,
          update.postId,
          input,
          uploadedImages,
        );
        const [item] = await rows(
          "SELECT slug FROM articles WHERE id = ?",
          [update.postId],
          connection,
        );
        return {
          slug: String(item.slug),
          revision: update.expectedRevision + 1,
        };
      }
      const base = slugBase(fields.title);
      let slug = base;
      for (
        let suffix = 2;
        (
          await rows(
            "SELECT id FROM articles WHERE slug = ?",
            [slug],
            connection,
          )
        ).length;
        suffix++
      )
        slug = base + "-" + suffix;
      const saved = await mutate(
        "INSERT INTO articles (mutation_key, slug, title, category, body, status, published_at) VALUES (?, ?, ?, ?, ?, 'publish', UTC_TIMESTAMP(3))",
        [
          input.mutationKey ?? null,
          slug,
          fields.title,
          fields.category,
          fields.body,
        ],
        connection,
      );
      await writeArticleImages(
        connection,
        saved.insertId,
        input,
        uploadedImages,
      );
      return { slug, revision: 1 };
    });
    return {
      status: "success",
      ...result,
      articlePath: "/news/" + result.slug,
      cacheWarning: false,
      uploadedImages,
    };
  } catch (error) {
    if (error instanceof RevisionConflict)
      return {
        status: "error",
        message:
          "This article changed since you opened it. Reload to review the latest version.",
        uploadedImages,
      };
    // Resolve a lost create response through the unique request identity.
    if (!update) {
      try {
        const [previous] = await rows(
          "SELECT slug, revision FROM articles WHERE mutation_key = ?",
          [input.mutationKey ?? null],
        );
        if (previous)
          return {
            status: "success",
            slug: previous.slug,
            articlePath: "/news/" + previous.slug,
            revision: Number(previous.revision),
            cacheWarning: false,
            uploadedImages,
          };
      } catch {
        /* Preserve the uncertain outcome; never create a second request identity here. */
      }
    }
    return {
      status: "uncertain",
      message:
        "The save could not be confirmed. Reload to check your articles before retrying.",
      uploadedImages,
    };
  }
}
export async function publishArticle(
  input: PublishArticleInput,
): Promise<PublishArticleResult> {
  return saveArticle(input);
}
