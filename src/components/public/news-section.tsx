"use client";

import { useState } from "react";
import { ArrowRight, ChevronUp } from "lucide-react";

import type { ArticleListResult } from "@/lib/content/types";
import { ArticleCard } from "@/components/public/article-card";
import { Reveal } from "@/components/public/reveal";

export function NewsSection({ result }: { result: ArticleListResult }) {
  const [expanded, setExpanded] = useState(false);
  const articles = result.status === "ok" ? result.articles : [];
  const visibleArticles = expanded ? articles : articles.slice(0, 3);

  return (
    <section id="news" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with 'View More' at upper right */}
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-school-green/20 bg-school-green/5 px-3.5 py-1 text-xs font-bold tracking-widest text-school-green-dark uppercase shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-school-green" />
              News &amp; Announcements
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              What&apos;s Happening at FGS
            </h2>
            <div className="mt-3.5 h-1 w-20 rounded-full bg-gradient-to-r from-school-green to-school-green-light" />
            <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
              Stay updated with the latest announcements, events, and happenings
              at Flor de Grace School.
            </p>
          </div>

          {/* Upper Right 'View More' Option */}
          {result.status === "ok" && articles.length > 3 && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-full border border-neutral-200/90 bg-white px-5 py-2.5 text-xs font-bold text-neutral-800 shadow-xs transition-all hover:scale-105 hover:border-school-green/50 hover:bg-neutral-50 hover:text-school-green hover:shadow-md focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 sm:self-end"
            >
              <span>{expanded ? "Show Less" : "View More"}</span>
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5 text-school-green" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5 text-school-green" />
              )}
            </button>
          )}
        </Reveal>

        {result.status === "unavailable" ? (
          <div className="mt-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-14 text-center">
            <p className="text-sm font-medium text-neutral-600">
              News is unavailable right now. Please check back soon.
            </p>
          </div>
        ) : articles.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-14 text-center">
            <p className="text-sm font-medium text-neutral-600">
              No news or announcements have been published yet.
            </p>
          </div>
        ) : (
          /* Articles Grid */
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleArticles.map((post, index) => (
              <Reveal key={post.slug} step={index % 3} className="h-full">
                <ArticleCard article={post} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
