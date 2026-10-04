import { requireAdmin } from "@/lib/auth/require-admin";
import { randomUUID } from "node:crypto";
import NewArticleForm from "./new-article-form";
export default async function NewArticlePage() {
  await requireAdmin();
  return <NewArticleForm mutationKey={randomUUID()} />;
}
