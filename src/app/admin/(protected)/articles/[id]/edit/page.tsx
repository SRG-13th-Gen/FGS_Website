import { requireAdmin } from "@/lib/auth/require-admin";
import { notFound } from "next/navigation";
import { getArticleForEdit } from "@/lib/content/admin-articles";
import { EditArticleForm } from "./edit-article-form";
export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isSafeInteger(postId) || postId <= 0) notFound();
  const result = await getArticleForEdit(postId);
  if (result.status === "not-found") notFound();
  if (result.status === "unavailable")
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
        <p className="text-sm text-neutral-500">
          This article could not be loaded. Please try again.
        </p>
      </div>
    );
  return <EditArticleForm initial={result.article} />;
}
