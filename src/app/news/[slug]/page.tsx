import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Share2,
  Tag,
  Building2,
  Phone,
  Mail,
} from "lucide-react";

import { getAllArticles, getArticleBySlug } from "@/lib/articles";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found | Flor de Grace School Inc.",
    };
  }

  return {
    title: `${article.title} | Flor de Grace School Inc.`,
    description: article.excerpt,
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const otherArticles = getAllArticles().filter((a) => a.slug !== article.slug);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-neutral-50/50 pt-24 pb-20 sm:pt-28 sm:pb-28">
        <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back Link */}
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/#news"
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-school-green"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to News &amp; Events</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-school-green-light px-3 py-1 text-xs font-bold uppercase tracking-wider text-school-green">
              <Tag className="h-3 w-3" />
              {article.category}
            </span>
          </div>

          {/* Article Header Card */}
          <header className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-10">
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
              <Calendar className="h-3.5 w-3.5 text-school-green" />
              <span>{article.date}</span>
              <span>•</span>
              <span>Flor de Grace School Administration</span>
            </div>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl md:text-4xl lg:text-5xl leading-tight">
              {article.title}
            </h1>

            <p className="mt-4 text-base italic text-neutral-600 sm:text-lg">
              {article.excerpt}
            </p>

            {/* Featured Cover Image */}
            {article.coverImage && (
              <figure className="mt-8 overflow-hidden rounded-2xl border border-neutral-200/80 shadow-sm">
                <div className="relative aspect-[16/9] w-full bg-neutral-100 sm:aspect-[21/9]">
                  <Image
                    src={article.coverImage}
                    alt={article.coverImageCaption || article.title}
                    fill
                    priority
                    className="object-cover"
                  />
                </div>
                {article.coverImageCaption && (
                  <figcaption className="border-t border-neutral-100 bg-neutral-50/80 px-4 py-3 text-center text-xs italic text-neutral-600 sm:text-sm">
                    {article.coverImageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Main Article Body */}
            <div className="mt-10 space-y-6 text-base leading-relaxed text-neutral-700 sm:text-lg sm:leading-8">
              {article.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* School Contact Footer Card inside Article */}
            <div className="mt-12 rounded-2xl border border-school-green/20 bg-school-green-light/40 p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    Flor de Grace School Inc.
                  </h2>
                  <p className="mt-1 text-xs text-neutral-600 sm:text-sm">
                    74 Gold St, Quezon City, 1121 Metro Manila
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-school-green-dark">
                  <a
                    href="tel:09682200677"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 shadow-sm transition-colors hover:bg-neutral-50"
                  >
                    <Phone className="h-3.5 w-3.5 text-school-green" />
                    <span>09682200677</span>
                  </a>
                  <a
                    href="mailto:flordegrace.school2001@gmail.com"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 shadow-sm transition-colors hover:bg-neutral-50"
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
                  className="text-xs font-semibold text-school-green hover:underline sm:text-sm"
                >
                  View All News →
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {otherArticles.map((other) => (
                  <Link
                    key={other.slug}
                    href={`/news/${other.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all hover:border-school-green/40 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <span className="w-fit rounded-full bg-school-green-light px-2.5 py-0.5 text-[11px] font-bold text-school-green">
                      {other.category}
                    </span>
                    <h3 className="mt-3 text-base font-bold text-neutral-900 transition-colors group-hover:text-school-green">
                      {other.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-neutral-600 line-clamp-2">
                      {other.excerpt}
                    </p>
                    <span className="mt-4 inline-flex items-center text-xs font-semibold text-school-green">
                      Read full article →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer />
    </>
  );
}
