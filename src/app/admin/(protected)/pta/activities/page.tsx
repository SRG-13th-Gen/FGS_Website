import { requireAdmin } from "@/lib/auth/require-admin";
import {
  AdminArticleList,
  type ArticleListSearchParams,
} from "@/app/admin/(protected)/articles/article-list";

export default async function AdminPtaActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<ArticleListSearchParams>;
}) {
  await requireAdmin();
  return (
    <AdminArticleList
      searchParams={searchParams}
      basePath="/admin/pta/activities"
      lockedCategory="pta"
    />
  );
}
