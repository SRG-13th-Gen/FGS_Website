import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

import type { Article } from "@/lib/content/types";
import {
  ARTICLE_CATEGORY_LABELS,
  formatArticleDate,
} from "@/lib/content/display";

const CATEGORY_BADGES: Record<string, string> = {
  announcements: "bg-amber-50 text-amber-800 border-amber-300/80",
  events: "bg-blue-50 text-blue-800 border-blue-300/80",
  clubs: "bg-purple-50 text-purple-800 border-purple-300/80",
  pta: "bg-teal-50 text-teal-800 border-teal-300/80",
  alumni: "bg-emerald-50 text-emerald-800 border-emerald-300/80",
};

/** The article card shared by the homepage feed, /alumni and /pta. */
export function ArticleCard({ article }: { article: Article }) {
  const badgeStyle =
    CATEGORY_BADGES[article.category] ||
    "bg-neutral-50 text-neutral-800 border-neutral-300/80";

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-school-green/50 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      {/* Image banner with overlay */}
      <div className="relative h-52 w-full overflow-hidden bg-neutral-100">
        {article.coverImage ? (
          <>
            <Image
              src={article.coverImage.url}
              alt={article.coverImage.alt || article.title}
              fill
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
            <Calendar className="h-10 w-10 text-neutral-300" />
          </div>
        )}

        {/* Floating frosted date chip */}
        <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5 rounded-lg bg-black/55 px-2.5 py-1 text-xs font-semibold text-white shadow-xs backdrop-blur-md">
          <Calendar className="h-3 w-3 text-school-yellow" />
          <span>{formatArticleDate(article.publishedAt)}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <span
          className={`mb-3 inline-block w-fit rounded-full border px-3 py-0.5 text-xs font-bold tracking-wider uppercase ${badgeStyle}`}
        >
          {ARTICLE_CATEGORY_LABELS[article.category]}
        </span>

        <h3 className="line-clamp-2 text-lg font-bold text-neutral-900 transition-colors group-hover:text-school-green">
          {article.title}
        </h3>

        <p className="mt-2.5 line-clamp-2 flex-1 text-sm leading-relaxed text-neutral-600">
          {article.excerpt}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs">
          <span className="font-semibold text-school-green-dark">
            FGS Newsroom
          </span>
          <span className="inline-flex items-center gap-1.5 font-bold text-school-green-dark transition-all group-hover:text-school-green">
            <span>Read full article</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
