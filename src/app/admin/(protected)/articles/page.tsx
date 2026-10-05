import { requireAdmin } from "@/lib/auth/require-admin";

import { AdminArticleList, type ArticleListSearchParams } from "./article-list";

export default async function AdminAllArticlesPage({
  searchParams,
}: {
  searchParams: Promise<ArticleListSearchParams>;
}) {
  await requireAdmin();
  return (
    <AdminArticleList searchParams={searchParams} basePath="/admin/articles" />
  );
}
