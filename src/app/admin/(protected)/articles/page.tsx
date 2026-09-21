import Link from "next/link";
import Image from "next/image";
import { FilePlus, ImageOff, PenLine, Search } from "lucide-react";

import { listArticlesForAdmin } from "@/lib/wordpress/admin-articles";
import {
  ARTICLE_CATEGORIES,
  type ArticleCategorySlug,
} from "@/lib/wordpress/types";
import {
  ARTICLE_CATEGORY_LABELS,
  formatArticleDateFull,
} from "@/lib/wordpress/display";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { TrashArticleButton } from "./trash-article-button";

function isArticleCategory(value: string): value is ArticleCategorySlug {
  return (ARTICLE_CATEGORIES as readonly string[]).includes(value);
}

function buildHref(
  base: { q: string; category: string; page: number },
  overrides: Partial<{ q: string; category: string; page: number }>,
): string {
  const next = { ...base, ...overrides };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.category !== "all") params.set("category", next.category);
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `/admin/articles?${qs}` : "/admin/articles";
}

export default async function AdminAllArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const category =
    params.category && isArticleCategory(params.category)
      ? params.category
      : "all";
  const pageParam = Number(params.page ?? 1);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const result = await listArticlesForAdmin({ search: q, category, page });

  const current = { q, category, page };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            All Articles
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Search, filter, edit, or trash published articles.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-xl bg-school-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-school-green-dark"
        >
          <FilePlus className="h-4 w-4" />
          <span>New Article</span>
        </Link>
      </div>

      <form
        method="get"
        className="flex flex-col gap-3 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by title..."
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-school-green focus:bg-white focus:ring-2 focus:ring-school-green/20 focus:outline-none"
          />
        </div>
        <NativeSelect name="category" defaultValue={category}>
          <NativeSelectOption value="all">All categories</NativeSelectOption>
          {ARTICLE_CATEGORIES.map((slug) => (
            <NativeSelectOption key={slug} value={slug}>
              {ARTICLE_CATEGORY_LABELS[slug]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <button
          type="submit"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
        >
          Search
        </button>
      </form>

      {result.status === "unavailable" ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
          <p className="text-sm text-neutral-500">
            Couldn&apos;t reach WordPress to load articles. Check the local CMS
            connection and try again.
          </p>
        </div>
      ) : result.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-neutral-900">
            No articles found.
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {q || category !== "all"
              ? "Try a different search or category."
              : "Publish your first article to see it here."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="relative h-10 w-14 overflow-hidden rounded-md bg-neutral-100">
                      {article.coverImage ? (
                        <Image
                          src={article.coverImage.url}
                          alt={article.coverImage.alt || article.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-300">
                          <ImageOff className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-medium text-neutral-900">
                    {article.title}
                  </TableCell>
                  <TableCell>
                    {article.category ? (
                      ARTICLE_CATEGORY_LABELS[article.category]
                    ) : (
                      <span className="text-neutral-400">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell className="text-neutral-500">
                    {formatArticleDateFull(article.publishedAt)}
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      Published
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                      >
                        <PenLine className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Link>
                      <TrashArticleButton
                        id={article.id}
                        title={article.title}
                        articlePath={`/news/${article.slug}`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {result.status === "ok" && result.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={buildHref(current, { page: Math.max(1, page - 1) })}
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-40" : ""}
              />
            </PaginationItem>
            {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
              (pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href={buildHref(current, { page: pageNumber })}
                    isActive={pageNumber === page}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href={buildHref(current, {
                  page: Math.min(result.totalPages, page + 1),
                })}
                aria-disabled={page >= result.totalPages}
                className={
                  page >= result.totalPages
                    ? "pointer-events-none opacity-40"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
