import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

import type { Article } from "@/lib/content/types";
import {
  ARTICLE_CATEGORY_LABELS,
  formatArticleDate,
} from "@/lib/content/display";

/** The article card shared by the homepage feed, /alumni and /pta. */
export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-school-green/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      {/* Image banner */}
      <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
        {article.coverImage ? (
          <Image
            src={article.coverImage.url}
            alt={article.coverImage.alt || article.title}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/40">
            <Calendar className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-6">
        <span className="mb-2 inline-block w-fit rounded-full bg-school-green-light px-3 py-0.5 text-xs font-semibold text-school-green-dark">
          {ARTICLE_CATEGORY_LABELS[article.category]}
        </span>
        <h3 className="text-base font-bold text-neutral-900 transition-colors group-hover:text-school-green">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-neutral-600">
          {article.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs">
          <span className="text-neutral-500">
            {formatArticleDate(article.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-school-green-dark transition-transform group-hover:translate-x-0.5">
            Read full article <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
