"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight, ChevronUp } from "lucide-react";

import { getAllArticles } from "@/lib/articles";

export function NewsSection() {
  const [expanded, setExpanded] = useState(false);
  const allArticles = getAllArticles();
  const visibleArticles = expanded ? allArticles : allArticles.slice(0, 3);

  return (
    <section id="news" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with 'View More' at upper right */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-school-green">
              News &amp; Announcements
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              What&apos;s Happening at FGS
            </h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-school-green" />
            <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Stay updated with the latest announcements, events, and happenings at Flor de Grace School.
            </p>
          </div>

          {/* Upper Right 'View More' Option */}
          {allArticles.length > 3 && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 shadow-sm transition-all hover:border-school-green/50 hover:bg-neutral-50 hover:text-school-green hover:shadow sm:self-end active:scale-95"
            >
              <span>{expanded ? "Show Less" : "View More"}</span>
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5 text-school-green" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5 text-school-green" />
              )}
            </button>
          )}
        </div>

        {/* Articles Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleArticles.map((post) => (
            <Link
              key={post.slug}
              href={`/news/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:border-school-green/40 hover:shadow-md hover:-translate-y-1"
            >
              {/* Image banner */}
              <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
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
                <span className="mb-2 inline-block w-fit rounded-full bg-school-green-light px-3 py-0.5 text-xs font-semibold text-school-green">
                  {post.category}
                </span>
                <h3 className="text-base font-bold text-neutral-900 transition-colors group-hover:text-school-green">
                  {post.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs">
                  <span className="text-muted-foreground/70">{post.date}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-school-green transition-transform group-hover:translate-x-0.5">
                    Read full article <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
