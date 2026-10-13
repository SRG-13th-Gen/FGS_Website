export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Tag,
  Phone,
  Mail,
  ChevronRight,
  ArrowRight,
  BookOpen,
  FileText,
  Users,
  GraduationCap,
  Image as ImageIcon,
} from "lucide-react";

import { getArticleBySlug, getPublishedArticles } from "@/lib/content/reads";
import { schoolInfoContent } from "@/lib/content/sections/content";
import {
  ARTICLE_CATEGORY_LABELS,
  articleAreaNav,
  articleAreaOptions,
  formatArticleDate,
} from "@/lib/content/display";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

const QUICK_LINKS = [
  { label: "About Us", href: "/#about", icon: BookOpen },
  { label: "Admission & Requirements", href: "/#admission", icon: FileText },
  { label: "Student Organizations", href: "/#clubs", icon: Users },
  { label: "Campus Life Gallery", href: "/#gallery", icon: ImageIcon },
  { label: "Parent-Teacher Association", href: "/pta", icon: Users },
  { label: "Alumni Network", href: "/alumni", icon: GraduationCap },
  { label: "Contact Us", href: "/#contact", icon: Phone },
];

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArticleBySlug(slug);

  if (result.status === "not-found") notFound();
  if (result.status !== "ok") {
    return {
      title: "Article Unavailable | Flor de Grace School Inc.",
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
          className="min-h-screen bg-surface-soft pt-24 pb-20 sm:pt-28 sm:pb-28"
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
  const area = articleAreaNav(article.category);
  const othersResult = await getPublishedArticles(
    articleAreaOptions(article.category),
  );
  let otherArticles =
    othersResult.status === "ok"
      ? othersResult.articles.filter((a) => a.slug !== article.slug).slice(0, 4)
      : [];

  // Fallback: If no other articles in this specific section, show latest articles from all categories
  if (otherArticles.length === 0) {
    const fallbackResult = await getPublishedArticles();
    if (fallbackResult.status === "ok") {
      otherArticles = fallbackResult.articles
        .filter((a) => a.slug !== article.slug)
        .slice(0, 4);
    }
  }

  return (
    <>
      <Navbar schoolInfo={schoolInfo} />

      <main
        id="main-content"
        className="min-h-screen bg-surface-soft pt-24 pb-20 sm:pt-28 sm:pb-28"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Category bar */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <Link
              href={area.href}
              className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-neutral-600 transition-colors hover:text-school-green-dark focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{area.backLabel}</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-school-green/30 bg-school-green/10 px-3.5 py-1 text-xs font-bold tracking-wider text-school-green-dark uppercase">
              <Tag className="h-3 w-3" />
              {ARTICLE_CATEGORY_LABELS[article.category]}
            </span>
          </div>

          {/* Responsive Two-Column Grid on Desktop */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
            {/* Primary Column: Article Content (8 of 12) */}
            <article className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-10 md:p-12 lg:col-span-8">
              <header>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-neutral-500">
                  <span className="flex items-center gap-1.5 text-school-green-dark">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatArticleDate(article.publishedAt)}</span>
                  </span>
                  <span>•</span>
                  <span>Flor de Grace School Administration</span>
                </div>

                <h1 className="mt-4 text-2xl leading-tight font-extrabold tracking-tight break-words text-neutral-900 sm:text-3xl md:text-4xl lg:text-5xl">
                  {article.title}
                </h1>

                {article.excerpt && (
                  <p className="mt-4 text-base leading-relaxed text-neutral-600 italic sm:text-lg">
                    {article.excerpt}
                  </p>
                )}
              </header>

              {/* Featured Cover Image */}
              {article.coverImage && (
                <figure className="mt-8 overflow-hidden rounded-3xl border border-neutral-200/80 shadow-md">
                  <div className="relative aspect-[16/9] w-full bg-neutral-100 sm:aspect-[21/9]">
                    <Image
                      src={article.coverImage.url}
                      alt={article.coverImage.alt || article.title}
                      fill
                      priority
                      sizes="(max-width: 1023px) 100vw, 800px"
                      className="object-cover"
                    />
                  </div>
                  {article.coverImage.caption && (
                    <figcaption className="border-t border-neutral-100 bg-neutral-50/90 px-4 py-3 text-center text-xs text-neutral-600 italic sm:text-sm">
                      {article.coverImage.caption}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Main Article Body — sanitized HTML */}
              <div
                className="mt-10 max-w-[68ch] text-base leading-relaxed text-neutral-700 sm:text-lg sm:leading-8 [&_a]:text-school-green-dark [&_a]:underline [&_a]:underline-offset-2 [&_figcaption]:border-t [&_figcaption]:border-neutral-100 [&_figcaption]:bg-neutral-50/80 [&_figcaption]:px-4 [&_figcaption]:py-3 [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:text-neutral-600 [&_figcaption]:italic [&_figure]:my-8 [&_figure]:overflow-hidden [&_figure]:rounded-2xl [&_figure]:border [&_figure]:border-neutral-200/80 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-neutral-900 [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-neutral-900 [&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-neutral-900 [&_img]:w-full [&_img]:object-cover [&_li]:mb-2 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-6 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-neutral-900 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6"
                dangerouslySetInnerHTML={{ __html: article.contentHtml }}
              />

              {/* School Contact Footer Card inside Article */}
              <div className="mt-12 rounded-2xl border border-school-green/30 bg-gradient-to-br from-school-green/10 via-school-green-light/30 to-school-yellow/10 p-6 sm:p-8">
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
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-neutral-200/60 bg-white px-3.5 py-2 shadow-xs transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <Phone className="h-3.5 w-3.5 text-school-green" />
                      <span>{schoolInfo.phone}</span>
                    </a>
                    <a
                      href={`mailto:${schoolInfo.email}`}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-neutral-200/60 bg-white px-3.5 py-2 shadow-xs transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <Mail className="h-3.5 w-3.5 text-school-green" />
                      <span>Inquire via Email</span>
                    </a>
                  </div>
                </div>
              </div>
            </article>

            {/* Secondary Column: Sidebar on Desktop (4 of 12) */}
            <aside className="space-y-8 lg:sticky lg:top-24 lg:col-span-4">
              {/* Other Stories */}
              {otherArticles.length > 0 && (
                <section
                  aria-labelledby="sidebar-other-articles"
                  className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-7"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div>
                      <span className="text-[11px] font-bold tracking-widest text-school-green-dark uppercase">
                        More Stories
                      </span>
                      <h2
                        id="sidebar-other-articles"
                        className="text-base font-extrabold tracking-tight text-neutral-900 sm:text-lg"
                      >
                        {area.moreHeading}
                      </h2>
                    </div>
                    <Link
                      href={area.href}
                      className="text-xs font-bold text-school-green-dark transition-colors hover:text-school-green hover:underline focus-visible:ring-2 focus-visible:ring-school-green focus-visible:outline-none"
                    >
                      {area.allLabel}
                    </Link>
                  </div>

                  <div className="mt-5 space-y-4">
                    {otherArticles.map((other) => (
                      <Link
                        key={other.slug}
                        href={`/news/${other.slug}`}
                        className="group flex gap-4 rounded-2xl p-2.5 transition-all duration-200 hover:bg-neutral-50 hover:shadow-xs focus-visible:ring-2 focus-visible:ring-school-green focus-visible:outline-none"
                      >
                        {other.coverImage ? (
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                            <Image
                              src={other.coverImage.url}
                              alt={other.coverImage.alt || other.title}
                              fill
                              sizes="80px"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                            <Calendar className="h-6 w-6 text-neutral-300" />
                          </div>
                        )}

                        <div className="flex min-w-0 flex-1 flex-col justify-center">
                          <span className="text-[11px] font-semibold text-neutral-500">
                            {formatArticleDate(other.publishedAt)}
                          </span>
                          <h3 className="mt-1 line-clamp-2 text-sm font-bold text-neutral-900 transition-colors group-hover:text-school-green">
                            {other.title}
                          </h3>
                          <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-school-green-dark transition-transform group-hover:translate-x-1">
                            <span>Read story</span>
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Quick Links Card */}
              <nav
                aria-label="Quick Links"
                className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-7"
              >
                <div className="border-b border-neutral-100 pb-4">
                  <span className="text-[11px] font-bold tracking-widest text-school-green-dark uppercase">
                    Explore FGS
                  </span>
                  <h2 className="text-base font-extrabold tracking-tight text-neutral-900 sm:text-lg">
                    Quick Links
                  </h2>
                </div>

                <ul className="mt-4 space-y-1">
                  {QUICK_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-school-green-dark focus-visible:ring-2 focus-visible:ring-school-green focus-visible:outline-none"
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-school-green" />
                            <span>{link.label}</span>
                          </span>
                          <ChevronRight className="h-4 w-4 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-school-green" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      </main>

      <Footer schoolInfo={schoolInfo} />
    </>
  );
}
