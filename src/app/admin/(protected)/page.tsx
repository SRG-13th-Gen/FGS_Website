import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Users,
  GraduationCap,
  Sparkles,
  Images,
  Mail,
  Settings,
  FilePlus,
  ExternalLink,
  ArrowRight,
  Pencil,
} from "lucide-react";

import {
  aboutContent,
  admissionContent,
  clubsContent,
  contactContent,
  galleryContent,
  heroContent,
  schoolInfoContent,
} from "@/lib/wordpress/sections/content";
import { getPublishedArticles } from "@/lib/wordpress/reads";
import {
  ARTICLE_CATEGORY_LABELS,
  formatArticleDate,
} from "@/lib/wordpress/display";
import { formatLastUpdated } from "@/components/admin/format";

const SECTION_CARDS = [
  {
    label: "Hero",
    href: "/admin/sections/hero",
    icon: Home,
    adapter: heroContent,
  },
  {
    label: "About",
    href: "/admin/sections/about",
    icon: Users,
    adapter: aboutContent,
  },
  {
    label: "Admission",
    href: "/admin/sections/admission",
    icon: GraduationCap,
    adapter: admissionContent,
  },
  {
    label: "Clubs",
    href: "/admin/sections/clubs",
    icon: Sparkles,
    adapter: clubsContent,
  },
  {
    label: "Gallery",
    href: "/admin/sections/gallery",
    icon: Images,
    adapter: galleryContent,
  },
  {
    label: "Contact",
    href: "/admin/sections/contact",
    icon: Mail,
    adapter: contactContent,
  },
  {
    label: "School Info",
    href: "/admin/sections/school-info",
    icon: Settings,
    adapter: schoolInfoContent,
  },
] as const;

export default async function AdminDashboardPage() {
  const [lastModifiedBySection, articlesResult] = await Promise.all([
    Promise.all(SECTION_CARDS.map((card) => card.adapter.getLastModified())),
    getPublishedArticles(),
  ]);

  const recentArticles =
    articlesResult.status === "ok" ? articlesResult.articles.slice(0, 5) : [];

  return (
    <div className="space-y-10">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-xl bg-school-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-school-green-dark"
        >
          <FilePlus className="h-4 w-4" />
          <span>Add News</span>
        </Link>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
        >
          <ExternalLink className="h-4 w-4" />
          <span>View site</span>
        </Link>
      </div>

      {/* Website sections */}
      <section>
        <h2 className="text-sm font-bold tracking-wide text-neutral-500 uppercase">
          Website Sections
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECTION_CARDS.map((card, index) => (
            <div
              key={card.href}
              className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-school-green-light text-school-green">
                  <card.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {card.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Last updated:{" "}
                    {formatLastUpdated(lastModifiedBySection[index])}
                  </p>
                </div>
              </div>
              <Link
                href={card.href}
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white py-2 text-xs font-semibold text-neutral-700 transition-colors hover:border-school-green/40 hover:bg-school-green-light hover:text-school-green-dark"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Recent news */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wide text-neutral-500 uppercase">
            Recent News
          </h2>
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1 text-xs font-semibold text-school-green hover:underline"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {articlesResult.status === "unavailable" ? (
          <p className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
            News is unavailable right now. Check the local WordPress connection.
          </p>
        ) : recentArticles.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
            No news published yet.{" "}
            <Link
              href="/admin/articles/new"
              className="font-semibold text-school-green hover:underline"
            >
              Write the first one
            </Link>
            .
          </p>
        ) : (
          <div className="mt-4 divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
            {recentArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/news/${article.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-neutral-50"
              >
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage.url}
                      alt={article.coverImage.alt || article.title}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-900">
                    {article.title}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {ARTICLE_CATEGORY_LABELS[article.category]} •{" "}
                    {formatArticleDate(article.publishedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
