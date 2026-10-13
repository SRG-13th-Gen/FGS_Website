"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, ChevronUp } from "lucide-react";

import { Reveal } from "@/components/public/reveal";
import type { GalleryView } from "@/lib/content/sections/gallery";

function chunkIntoFives<T>(items: T[]): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += 5) {
    chunks.push(items.slice(i, i + 5));
  }
  return chunks;
}

export function GallerySection({ content }: { content: GalleryView }) {
  const [expanded, setExpanded] = useState(false);
  const chunks = chunkIntoFives(content.photos);
  const visibleChunks = expanded ? chunks : chunks.slice(0, 1);

  return (
    <section id="gallery" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with 'View More' on the upper right */}
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold tracking-widest text-school-green-dark uppercase">
              {content.sectionLabel}
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              {content.heading}
            </h2>
            <div className="mt-3.5 h-1 w-20 rounded-full bg-gradient-to-r from-school-green to-school-green-light" />
            <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
              {content.intro}
            </p>
          </div>

          {chunks.length > 1 && (
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

        {content.photos.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-14 text-center">
            <p className="text-sm font-medium text-neutral-600">
              No photos have been added yet. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="mt-12 space-y-4">
            {visibleChunks.map((chunk, chunkIndex) => {
              const [big, ...rest] = chunk;
              return (
                <Reveal
                  key={chunkIndex}
                  className="grid grid-cols-2 gap-4 md:grid-cols-4"
                >
                  {big && (
                    <div className="group relative col-span-2 row-span-2 aspect-square overflow-hidden rounded-3xl border border-neutral-200/80 bg-neutral-100 shadow-xs transition-all duration-500 hover:-translate-y-1 hover:border-school-green/50 hover:shadow-2xl">
                      <Image
                        src={big.image.url}
                        alt={big.image.alt}
                        fill
                        sizes="(max-width: 767px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
                      {big.caption && (
                        <div className="absolute inset-x-0 bottom-0 p-5">
                          <span className="inline-block rounded-xl bg-black/40 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-md">
                            {big.caption}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {rest.map((photo, photoIndex) => (
                    <div
                      key={photoIndex}
                      className="group relative aspect-square overflow-hidden rounded-3xl border border-neutral-200/80 bg-neutral-100 shadow-xs transition-all duration-500 hover:-translate-y-1 hover:border-school-green/50 hover:shadow-xl"
                    >
                      <Image
                        src={photo.image.url}
                        alt={photo.image.alt}
                        fill
                        sizes="(max-width: 767px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-80" />
                      {photo.caption && (
                        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                          <span className="line-clamp-2 inline-block rounded-lg bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                            {photo.caption}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
