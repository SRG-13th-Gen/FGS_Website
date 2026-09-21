"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, ChevronUp } from "lucide-react";

import type { GalleryView } from "@/lib/wordpress/sections/gallery";

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold tracking-widest text-school-green uppercase">
              {content.sectionLabel}
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              {content.heading}
            </h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-school-green" />
            <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              {content.intro}
            </p>
          </div>

          {chunks.length > 1 && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 shadow-sm transition-all hover:border-school-green/50 hover:bg-neutral-50 hover:text-school-green hover:shadow sm:self-end"
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

        {content.photos.length === 0 ? (
          <p className="mt-12 text-sm text-muted-foreground">
            Photos will appear here once they are added in the admin dashboard.
          </p>
        ) : (
          <div className="mt-12 space-y-4">
            {visibleChunks.map((chunk, chunkIndex) => {
              const [big, ...rest] = chunk;
              return (
                <div
                  key={chunkIndex}
                  className="grid grid-cols-2 gap-4 md:grid-cols-4"
                >
                  {big && (
                    <div className="relative col-span-2 row-span-2 aspect-square overflow-hidden rounded-2xl border border-neutral-200/60 shadow-sm transition-all hover:shadow-md">
                      <Image
                        src={big.image.url}
                        alt={big.image.alt}
                        fill
                        className="object-cover"
                      />
                      {big.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <span className="text-xs font-medium text-white">
                            {big.caption}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {rest.map((photo, photoIndex) => (
                    <div
                      key={photoIndex}
                      className="relative aspect-square overflow-hidden rounded-2xl border border-neutral-200/60 shadow-sm transition-all hover:scale-[1.02]"
                    >
                      <Image
                        src={photo.image.url}
                        alt={photo.image.alt}
                        fill
                        className="object-cover"
                      />
                      {photo.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <span className="text-[10px] font-medium text-white">
                            {photo.caption}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
