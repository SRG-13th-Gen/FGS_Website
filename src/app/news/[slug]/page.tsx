import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, Phone, Mail } from "lucide-react";

import { getArticleBySlug, getPublishedArticles } from "@/lib/wordpress/reads";
import { schoolInfoContent } from "@/lib/wordpress/sections/content";
import {
  ARTICLE_CATEGORY_LABELS,
  formatArticleDate,
} from "@/lib/wordpress/display";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const result = await getPublishedArticles();
  // WordPress unreachable at build time: skip prerendering these, don't fail the build.
  // dynamicParams stays on (the App Router default), so slugs still render on request.
  if (result.status !== "ok") return [];
  return result.articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArticleBySlug(slug);

  if (result.status !== "ok") {
    return {
      title: "Article Not Found | Flor de Grace School Inc.",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${result.article.title} | Flor de Grace School Inc.`,
    description: result.article.excerpt,
    alternates: { canonical: `/news/${result.article.slug}` },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [result, schoolInfo] = await Promise.all([
    getArticleBySlug(slug),
    schoolInfoContent.get(),
  ]);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "unavailable") {
    return (
      <>
        <Navbar schoolInfo={schoolInfo} />
        <main
          id="main-content"
          className="min-h-screen bg-neutral-50/50 pt-24 pb-20 sm:pt-28 sm:pb-28"
        >
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
            <p className="rounded-2xl border border-neutral-200 bg-white p-10 text-sm font-medium text-neutral-600 shadow-sm">
              This article is unavailable right now. Please check back soon.
            </p>
            <Link
              href="/#news"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-school-green-dark hover:underline focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to News &amp; Events</span>
            </Link>
          </div>
        </main>
        <Footer schoolInfo={schoolInfo} />
      </>
    );
  }

  const { article } = result;
  const othersResult = await getPublishedArticles();
  const otherArticles =
    othersResult.status === "ok"
      ? othersResult.articles.filter((a) => a.slug !== article.slug).slice(0, 4)
      : [];

  return (
    <>
      <Navbar schoolInfo={schoolInfo} />

      <main
        id="main-content"
        className="min-h-screen bg-neutral-50/50 pt-24 pb-20 sm:pt-28 sm:pb-28"
      >
        <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back Link */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <Link
              href="/#news"
              className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-neutral-600 transition-colors hover:text-school-green-dark focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to News &amp; Events</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-school-green-light px-3 py-1 text-xs font-bold tracking-wider text-school-green-dark uppercase">
              <Tag className="h-3 w-3" />
              {ARTICLE_CATEGORY_LABELS[article.category]}
            </span>
          </div>

          {/* Article Header Card */}
          <header className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-10">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-neutral-500">
              <Calendar className="h-3.5 w-3.5 text-school-green" />
              <span>{formatArticleDate(article.publishedAt)}</span>
              <span>•</span>
              <span>Flor de Grace School Administration</span>
            </div>

            <h1 className="mt-4 text-2xl leading-tight font-extrabold tracking-tight break-words text-neutral-900 sm:text-3xl md:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="mt-4 text-base text-neutral-600 italic sm:text-lg">
                {article.excerpt}
              </p>
            )}

            {/* Featured Cover Image */}
            {article.coverImage && (
              <figure className="mt-8 overflow-hidden rounded-2xl border border-neutral-200/80 shadow-sm">
                <div className="relative aspect-[16/9] w-full bg-neutral-100 sm:aspect-[21/9]">
                  <Image
                    src={article.coverImage.url}
                    alt={article.coverImage.alt || article.title}
                    fill
                    priority
                    sizes="(max-width: 896px) 100vw, 896px"
                    className="object-cover"
                  />
                </div>
                {article.coverImage.caption && (
                  <figcaption className="border-t border-neutral-100 bg-neutral-50/80 px-4 py-3 text-center text-xs text-neutral-600 italic sm:text-sm">
                    {article.coverImage.caption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Main Article Body — sanitized WordPress HTML (paragraphs, lists, links, headings, images with captions) */}
            <div
              className="mt-10 max-w-[68ch] text-base leading-relaxed text-neutral-700 sm:text-lg sm:leading-8 [&_a]:text-school-green-dark [&_a]:underline [&_a]:underline-offset-2 [&_figcaption]:border-t [&_figcaption]:border-neutral-100 [&_figcaption]:bg-neutral-50/80 [&_figcaption]:px-4 [&_figcaption]:py-3 [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:text-neutral-600 [&_figcaption]:italic [&_figure]:my-8 [&_figure]:overflow-hidden [&_figure]:rounded-2xl [&_figure]:border [&_figure]:border-neutral-200/80 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-neutral-900 [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-neutral-900 [&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-neutral-900 [&_img]:w-full [&_img]:object-cover [&_li]:mb-2 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-6 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-neutral-900 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: article.contentHtml }}
            />

            {/* School Contact Footer Card inside Article */}
            <div className="mt-12 rounded-2xl border border-school-green/20 bg-school-green-light/40 p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    {schoolInfo.schoolName}
                  </h2>
                  <p className="mt-1 text-xs text-neutral-600 sm:text-sm">
                    {schoolInfo.address}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-school-green-dark">
                  <a
                    href={`tel:${schoolInfo.phone}`}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-white px-3 py-2 shadow-sm transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <Phone className="h-3.5 w-3.5 text-school-green" />
                    <span>{schoolInfo.phone}</span>
                  </a>
                  <a
                    href={`mailto:${schoolInfo.email}`}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-white px-3 py-2 shadow-sm transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <Mail className="h-3.5 w-3.5 text-school-green" />
                    <span>Inquire via Email</span>
                  </a>
                </div>
              </div>
            </div>
          </header>

          {/* More News & Announcements */}
          {otherArticles.length > 0 && (
            <section className="mt-16">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
                  More News &amp; Updates
                </h2>
                <Link
                  href="/#news"
                  className="inline-flex min-h-11 items-center rounded-md text-xs font-semibold text-school-green-dark hover:underline focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none sm:text-sm"
                >
                  View All News →
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {otherArticles.map((other) => (
                  <Link
                    key={other.slug}
                    href={`/news/${other.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-school-green/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <span className="w-fit rounded-full bg-school-green-light px-2.5 py-0.5 text-xs font-bold text-school-green-dark">
                      {ARTICLE_CATEGORY_LABELS[other.category]}
                    </span>
                    <h3 className="mt-3 text-base font-bold text-neutral-900 transition-colors group-hover:text-school-green">
                      {other.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-neutral-600">
                      {other.excerpt}
                    </p>
                    <span className="mt-4 inline-flex items-center text-xs font-semibold text-school-green-dark">
                      Read full article →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer schoolInfo={schoolInfo} />
    </>
  );
}
