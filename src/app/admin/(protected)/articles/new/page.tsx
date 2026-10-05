import { requireAdmin } from "@/lib/auth/require-admin";
import { randomUUID } from "node:crypto";
import { ARTICLE_CATEGORIES } from "@/lib/content/types";
import NewArticleForm from "./new-article-form";

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await requireAdmin();
  const { category } = await searchParams;
  // Only an allowlisted value preselects a category; anything else keeps the default.
  const initialCategory = ARTICLE_CATEGORIES.find((slug) => slug === category);
  return (
    <NewArticleForm
      mutationKey={randomUUID()}
      initialCategory={initialCategory}
    />
  );
}
