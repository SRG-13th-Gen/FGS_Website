import { notFound } from "next/navigation";

import { getWordpressBaseUrl } from "@/lib/wordpress/client";
import { getArticleForEdit } from "@/lib/wordpress/admin-articles";

import { EditArticleForm } from "./edit-article-form";
import { ReadOnlyArticleView } from "./read-only-article-view";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId <= 0) notFound();

  const result = await getArticleForEdit(postId);

  if (result.status === "not-found") notFound();

  if (result.status === "unavailable") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
        <p className="text-sm text-neutral-500">
          Couldn&apos;t reach WordPress to load this article. Check the local
          CMS connection and try again.
        </p>
      </div>
    );
  }

  if (result.status === "readonly") {
    return (
      <ReadOnlyArticleView
        title={result.title}
        category={result.category}
        reason={result.reason}
        wordpressAdminUrl={`${getWordpressBaseUrl()}/wp-admin/post.php?post=${postId}&action=edit`}
      />
    );
  }

  return <EditArticleForm initial={result.article} />;
}
