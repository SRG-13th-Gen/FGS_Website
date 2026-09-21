import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";

import { ARTICLE_CATEGORY_LABELS } from "@/lib/wordpress/display";
import type { ArticleCategorySlug } from "@/lib/wordpress/types";

export function ReadOnlyArticleView({
  title,
  category,
  reason,
  wordpressAdminUrl,
}: {
  title: string;
  category: ArticleCategorySlug | null;
  reason: string;
  wordpressAdminUrl: string | null;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          {title}
        </h1>
        {category && (
          <span className="mt-2 inline-block rounded-full bg-school-green/10 px-3 py-1 text-xs font-bold tracking-wider text-school-green uppercase">
            {ARTICLE_CATEGORY_LABELS[category]}
          </span>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div className="space-y-2 text-sm">
          <p className="font-semibold">
            This article can&apos;t be edited here.
          </p>
          <p>{reason}</p>
          <p>
            Edit it directly in WordPress instead — its content will be
            preserved exactly, and it will still appear correctly on the
            website.
          </p>
          {wordpressAdminUrl && (
            <Link
              href={wordpressAdminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 font-semibold text-amber-900 underline hover:text-amber-950"
            >
              <span>Open in WordPress</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
