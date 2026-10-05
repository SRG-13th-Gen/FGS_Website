export const dynamic = "force-dynamic";

import type { Metadata } from "next";

import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { ArticleCard } from "@/components/public/article-card";
import { Reveal } from "@/components/public/reveal";
import { AreaNotice, AreaPageHeader } from "@/components/public/area-page";
import { getPublishedArticles } from "@/lib/content/reads";
import { schoolInfoContent } from "@/lib/content/sections/content";

// The root layout canonical is "/", so each page sets its own.
export const metadata: Metadata = {
  title: "PTA | Flor de Grace School Inc.",
  description: "PTA activities and events at Flor de Grace School Inc.",
  alternates: { canonical: "/pta" },
};

export default async function PtaPage() {
  const [articlesResult, schoolInfo] = await Promise.all([
    getPublishedArticles({ categories: ["pta"] }),
    schoolInfoContent.get(),
  ]);
  const articles =
    articlesResult.status === "ok" ? articlesResult.articles : [];

  return (
    <>
      <Navbar schoolInfo={schoolInfo} />

      <main id="main-content">
        <section className="bg-white pt-28 pb-20 sm:pt-32 lg:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AreaPageHeader
              label="PTA"
              heading="PTA Activities"
              intro="Activities and events from the Parent-Teacher Association of Flor de Grace School."
            />

            <div className="mt-12">
              {articlesResult.status === "unavailable" ? (
                <AreaNotice>
                  PTA activities are unavailable right now. Please check back
                  soon.
                </AreaNotice>
              ) : articles.length === 0 ? (
                <AreaNotice>
                  No PTA activities have been published yet.
                </AreaNotice>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article, index) => (
                    <Reveal
                      key={article.slug}
                      step={index % 3}
                      className="h-full"
                    >
                      <ArticleCard article={article} />
                    </Reveal>
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
