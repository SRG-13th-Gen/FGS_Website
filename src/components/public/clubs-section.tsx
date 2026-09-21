"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { SECTION_ICON_OPTIONS } from "@/lib/wordpress/sections/icons";
import type { ClubsContent } from "@/lib/wordpress/sections/clubs";

const ACCENT_STYLES = [
  {
    card: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    icon: "text-emerald-600",
  },
  {
    card: "bg-amber-50 text-amber-800 border-amber-200/60",
    icon: "text-amber-600",
  },
  {
    card: "bg-blue-50 text-blue-700 border-blue-200/60",
    icon: "text-blue-600",
  },
  {
    card: "bg-purple-50 text-purple-700 border-purple-200/60",
    icon: "text-purple-600",
  },
  {
    card: "bg-rose-50 text-rose-700 border-rose-200/60",
    icon: "text-rose-600",
  },
  {
    card: "bg-teal-50 text-teal-700 border-teal-200/60",
    icon: "text-teal-600",
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
    <section id="clubs" className="bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with Carousel Navigation */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold tracking-widest text-school-green-dark uppercase">
              {content.sectionLabel}
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              {content.heading}
            </h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-school-green" />
            <p className="mt-3 max-w-xl text-sm text-neutral-600 sm:text-base">
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
              className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-all hover:border-school-green/50 hover:bg-neutral-50 hover:text-school-green focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:bg-white disabled:hover:text-neutral-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => api?.scrollNext()}
              disabled={!api?.canScrollNext()}
              aria-label="Next club slide"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-all hover:border-school-green/50 hover:bg-neutral-50 hover:text-school-green focus-visible:ring-2 focus-visible:ring-school-green focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:bg-white disabled:hover:text-neutral-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Carousel Component */}
        <div className="mt-12">
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
                    <div className="group flex h-full flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-school-green/40 hover:shadow-md">
                      <div>
                        {/* Top: Icon + Category */}
                        <div className="flex items-center justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-100 bg-neutral-50 shadow-inner transition-transform duration-300 group-hover:scale-110">
                            <Icon className={`h-6 w-6 ${accent.icon}`} />
                          </div>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase ${accent.card}`}
                          >
                            {club.category}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="mt-5 text-lg font-bold text-neutral-900 transition-colors group-hover:text-school-green">
                          {club.name}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                          {club.description}
                        </p>
                      </div>

                      {/* Bottom Info */}
                      <div className="mt-6 border-t border-neutral-100 pt-4">
                        <span className="text-xs font-medium text-neutral-500">
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
            <div className="mt-4 flex flex-wrap justify-center">
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
                    className={`block h-2 rounded-full transition-all ${
                      current === index
                        ? "w-8 bg-school-green"
                        : "w-2 bg-neutral-300 group-hover:bg-neutral-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
