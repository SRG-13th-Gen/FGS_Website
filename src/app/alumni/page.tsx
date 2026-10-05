export const dynamic = "force-dynamic";

import type { Metadata } from "next";

import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { ArticleCard } from "@/components/public/article-card";
import { AlumniAchievements } from "@/components/public/alumni-achievements";
import { AreaNotice, AreaPageHeader } from "@/components/public/area-page";
import { getPublishedArticles } from "@/lib/content/reads";
import { ALUMNI_FALLBACK } from "@/lib/content/sections/alumni";
import {
  alumniContent,
  schoolInfoContent,
} from "@/lib/content/sections/content";

// The root layout canonical is "/", so each page sets its own.
export const metadata: Metadata = {
  title: "Alumni | Flor de Grace School Inc.",
  description:
    "Alumni achievements and activities at Flor de Grace School Inc.",
  alternates: { canonical: "/alumni" },
};

export default async function AlumniPage() {
  const [alumniResult, articlesResult, schoolInfo] = await Promise.all([
    alumniContent.getResult(),
    getPublishedArticles({ categories: ["alumni"] }),
    schoolInfoContent.get(),
  ]);
  const alumni =
    alumniResult.status === "ok" ? alumniResult.alumni : ALUMNI_FALLBACK;
  const articles =
    articlesResult.status === "ok" ? articlesResult.articles : [];

  return (
    <>
      <Navbar schoolInfo={schoolInfo} />

      <main id="main-content">
        <section className="bg-white pt-28 pb-20 sm:pt-32 lg:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AreaPageHeader
              label={alumni.sectionLabel}
              heading={alumni.heading}
              intro={alumni.intro}
            />

            <div className="mt-12">
              {alumniResult.status === "unavailable" ? (
                <AreaNotice>
                  Alumni achievements are unavailable right now. Please check
                  back soon.
                </AreaNotice>
              ) : alumni.achievements.length === 0 ? (
                <AreaNotice>
                  No alumni achievements have been published yet.
                </AreaNotice>
              ) : (
                <AlumniAchievements achievements={alumni.achievements} />
              )}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="alumni-activities"
          className="bg-neutral-50/50 py-20 lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2
              id="alumni-activities"
              className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
            >
              Alumni Activities
            </h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-school-green" />

            <div className="mt-12">
              {articlesResult.status === "unavailable" ? (
                <AreaNotice>
                  Alumni activities are unavailable right now. Please check back
                  soon.
                </AreaNotice>
              ) : articles.length === 0 ? (
                <AreaNotice>
                  No alumni activities have been published yet.
                </AreaNotice>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article) => (
                    <ArticleCard key={article.slug} article={article} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer schoolInfo={schoolInfo} />
    </>
  );
}
