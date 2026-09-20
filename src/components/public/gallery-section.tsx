"use client";

import { useState } from "react";
import { Image as ImageIcon, ArrowRight, ChevronUp } from "lucide-react";

export function GallerySection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="gallery" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with 'View More' on the upper right */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-school-green">
              Gallery
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Life at FGS
            </h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-school-green" />
            <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              A glimpse into the vibrant school life and memorable moments at Flor de Grace School.
            </p>
          </div>

          {/* Upper Right 'View More' Option */}
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
        </div>

        {/* First Gallery Set: 1 big picture on the left, 4 on the right */}
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* 1 Big Picture on the Left (col-span-2 row-span-2) */}
          <div className="col-span-2 row-span-2 flex aspect-square items-center justify-center rounded-2xl border border-neutral-200/60 bg-muted/40 shadow-sm transition-all hover:border-school-green/30 hover:shadow-md">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                <ImageIcon className="h-7 w-7 text-school-green/70" />
              </div>
              <span className="mt-3 text-xs font-medium text-neutral-500">
                Featured Campus Moment
              </span>
            </div>
          </div>

          {/* 4 Pictures on the Right (2x2 grid) */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded-2xl border border-neutral-200/60 bg-muted/40 shadow-sm transition-all hover:border-school-green/30 hover:scale-[1.02]"
            >
              <ImageIcon className="h-7 w-7 text-muted-foreground/30" />
            </div>
          ))}
        </div>

        {/* Additional Set (revealed when 'View More' is clicked) */}
        {expanded && (
          <div className="mt-4 grid grid-cols-2 gap-4 transition-all duration-300 md:grid-cols-4 animate-in fade-in">
            {/* 4 Pictures on Left */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`extra-small-${i}`}
                className="flex aspect-square items-center justify-center rounded-2xl border border-neutral-200/60 bg-muted/40 shadow-sm transition-all hover:border-school-green/30 hover:scale-[1.02]"
              >
                <ImageIcon className="h-7 w-7 text-muted-foreground/30" />
              </div>
            ))}

            {/* 1 Big Picture on Right */}
            <div className="col-span-2 row-span-2 flex aspect-square items-center justify-center rounded-2xl border border-neutral-200/60 bg-muted/40 shadow-sm transition-all hover:border-school-green/30 hover:shadow-md">
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <ImageIcon className="h-7 w-7 text-school-green/70" />
                </div>
                <span className="mt-3 text-xs font-medium text-neutral-500">
                  School Activities
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
