"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Reveal } from "@/components/public/reveal";
import { SECTION_ICON_OPTIONS } from "@/lib/content/sections/icons";
import type { ClubsContent } from "@/lib/content/sections/clubs";

const ACCENT_STYLES = [
  {
    badge: "bg-emerald-50 text-emerald-800 border-emerald-300/80",
    iconBg:
      "from-emerald-500/15 to-emerald-600/5 text-emerald-700 border-emerald-200/90",
    glow: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    indicator: "bg-emerald-500",
  },
  {
    badge: "bg-amber-50 text-amber-800 border-amber-300/80",
    iconBg:
      "from-amber-500/15 to-amber-600/5 text-amber-800 border-amber-200/90",
    glow: "hover:border-amber-500/50 hover:shadow-amber-500/10",
    indicator: "bg-amber-500",
  },
  {
    badge: "bg-blue-50 text-blue-800 border-blue-300/80",
    iconBg: "from-blue-500/15 to-blue-600/5 text-blue-700 border-blue-200/90",
    glow: "hover:border-blue-500/50 hover:shadow-blue-500/10",
    indicator: "bg-blue-500",
  },
  {
    badge: "bg-purple-50 text-purple-800 border-purple-300/80",
    iconBg:
      "from-purple-500/15 to-purple-600/5 text-purple-700 border-purple-200/90",
    glow: "hover:border-purple-500/50 hover:shadow-purple-500/10",
    indicator: "bg-purple-500",
  },
  {
    badge: "bg-rose-50 text-rose-800 border-rose-300/80",
    iconBg: "from-rose-500/15 to-rose-600/5 text-rose-700 border-rose-200/90",
    glow: "hover:border-rose-500/50 hover:shadow-rose-500/10",
    indicator: "bg-rose-500",
  },
  {
    badge: "bg-teal-50 text-teal-800 border-teal-300/80",
    iconBg: "from-teal-500/15 to-teal-600/5 text-teal-700 border-teal-200/90",
    glow: "hover:border-teal-500/50 hover:shadow-teal-500/10",
    indicator: "bg-teal-500",
  },
] as const;

export function ClubsSection({ content }: { content: ClubsContent }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setCurrent(api.selectedScrollSnap());

    // Embla's snap count and selected index are only known once the
    // carousel instance mounts — this is the documented embla-carousel
    // pattern for tracking pagination state, not state derivable from props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCount(api.scrollSnapList().length);
    onSelect();
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <section id="clubs" className="bg-surface-muted py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with Carousel Navigation */}
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

          {/* External Carousel Controls in Header */}
          <div className="flex items-center gap-2 self-start sm:self-end">
            <button
              type="button"
              onClick={() => api?.scrollPrev()}
              disabled={!api?.canScrollPrev()}
              aria-label="Previous club slide"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200/90 bg-white text-neutral-700 shadow-xs transition-all hover:scale-105 hover:border-school-green/50 hover:bg-neutral-50 hover:text-school-green hover:shadow-md focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:border-neutral-200 disabled:hover:bg-white disabled:hover:text-neutral-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => api?.scrollNext()}
              disabled={!api?.canScrollNext()}
              aria-label="Next club slide"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200/90 bg-white text-neutral-700 shadow-xs transition-all hover:scale-105 hover:border-school-green/50 hover:bg-neutral-50 hover:text-school-green hover:shadow-md focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:border-neutral-200 disabled:hover:bg-white disabled:hover:text-neutral-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </Reveal>

        {/* Carousel Component */}
        <Reveal className="mt-12">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {content.clubs.map((club, index) => {
                const Icon = SECTION_ICON_OPTIONS[club.icon];
                const accent = ACCENT_STYLES[index % ACCENT_STYLES.length];
                return (
                  <CarouselItem
                    key={club.name}
                    className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <div
                      className={`group flex h-full flex-col justify-between rounded-3xl border border-neutral-200/80 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1.5 ${accent.glow} hover:shadow-xl`}
                    >
                      <div>
                        {/* Top: Icon + Category */}
                        <div className="flex items-center justify-between">
                          <div
                            className={`flex h-13 w-13 items-center justify-center rounded-2xl border bg-gradient-to-br ${accent.iconBg} shadow-inner transition-transform duration-300 group-hover:scale-110`}
                          >
                            <Icon className="h-6 w-6" strokeWidth={2.2} />
                          </div>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase ${accent.badge}`}
                          >
                            {club.category}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="mt-6 text-xl font-bold text-neutral-900 transition-colors group-hover:text-school-green">
                          {club.name}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                          {club.description}
                        </p>
                      </div>

                      {/* Bottom Info */}
                      <div className="mt-6 flex items-center gap-2 border-t border-neutral-100 pt-4">
                        <div
                          className={`h-2 w-2 rounded-full ${accent.indicator}`}
                        />
                        <span className="text-xs font-semibold text-neutral-600">
                          {club.meetingDay}
                        </span>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>

          {/* Dots Indicator */}
          {count > 0 && (
            <div className="mt-6 flex flex-wrap justify-center">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={current === index}
                  onClick={() => api?.scrollTo(index)}
                  className="group flex h-11 w-11 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-school-green focus-visible:outline-none"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      current === index
                        ? "w-8 bg-school-green shadow-xs"
                        : "w-2 bg-neutral-300 group-hover:bg-neutral-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
