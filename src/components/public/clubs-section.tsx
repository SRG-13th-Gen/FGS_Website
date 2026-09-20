"use client";

import { useState, useEffect } from "react";
import {
  Palette,
  Music,
  Dumbbell,
  Monitor,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trophy,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

const CLUBS = [
  {
    name: "Arts & Crafts Club",
    category: "Creative Arts",
    icon: Palette,
    accentColor: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    iconColor: "text-emerald-600",
    description:
      "Express creativity through painting, sketching, paper craft, and collaborative mural projects.",
    meetingDay: "Wednesdays, 3:30 PM",
  },
  {
    name: "Music & Choir Club",
    category: "Performing Arts",
    icon: Music,
    accentColor: "bg-amber-50 text-amber-800 border-amber-200/60",
    iconColor: "text-amber-600",
    description:
      "Develop vocal harmony, choral singing, and musical instrument fundamentals for school programs.",
    meetingDay: "Tuesdays, 3:30 PM",
  },
  {
    name: "Sports & Athletics",
    category: "Physical Fitness",
    icon: Dumbbell,
    accentColor: "bg-blue-50 text-blue-700 border-blue-200/60",
    iconColor: "text-blue-600",
    description:
      "Build agility, team spirit, and sportsmanship through basketball, volleyball, and active play.",
    meetingDay: "Fridays, 3:30 PM",
  },
  {
    name: "Tech & Robotics Club",
    category: "STEM",
    icon: Monitor,
    accentColor: "bg-purple-50 text-purple-700 border-purple-200/60",
    iconColor: "text-purple-600",
    description:
      "Learn beginner-friendly coding, robotics kits, and digital problem-solving in a fun workshop environment.",
    meetingDay: "Thursdays, 3:30 PM",
  },
  {
    name: "Young Readers Club",
    category: "Literary & Debate",
    icon: BookOpen,
    accentColor: "bg-rose-50 text-rose-700 border-rose-200/60",
    iconColor: "text-rose-600",
    description:
      "Explore classic literature, storytelling, and develop confident public speaking and debate skills.",
    meetingDay: "Mondays, 3:30 PM",
  },
  {
    name: "Science Explorers",
    category: "Discovery",
    icon: Sparkles,
    accentColor: "bg-teal-50 text-teal-700 border-teal-200/60",
    iconColor: "text-teal-600",
    description:
      "Engage in hands-on science experiments, nature observation, and annual science fair projects.",
    meetingDay: "Wednesdays, 3:30 PM",
  },
];

export function ClubsSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section id="clubs" className="bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with Carousel Navigation */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-school-green">
              Clubs &amp; Activities
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Beyond the Classroom
            </h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-school-green" />
            <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Discover passions, build friendships, and cultivate lifelong talents through our extracurricular programs.
            </p>
          </div>

          {/* External Carousel Controls in Header */}
          <div className="flex items-center gap-2 self-start sm:self-end">
            <button
              type="button"
              onClick={() => api?.scrollPrev()}
              disabled={!api?.canScrollPrev()}
              aria-label="Previous club slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-all hover:border-school-green/50 hover:bg-neutral-50 hover:text-school-green disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:bg-white disabled:hover:text-neutral-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => api?.scrollNext()}
              disabled={!api?.canScrollNext()}
              aria-label="Next club slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-all hover:border-school-green/50 hover:bg-neutral-50 hover:text-school-green disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:bg-white disabled:hover:text-neutral-700"
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
              {CLUBS.map((club) => {
                const Icon = club.icon;
                return (
                  <CarouselItem
                    key={club.name}
                    className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <div className="group flex h-full flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-school-green/40 hover:shadow-md hover:-translate-y-1">
                      <div>
                        {/* Top: Icon + Category */}
                        <div className="flex items-center justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-50 shadow-inner border border-neutral-100 transition-transform duration-300 group-hover:scale-110">
                            <Icon className={`h-6 w-6 ${club.iconColor}`} />
                          </div>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${club.accentColor}`}
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
                        <span className="text-xs font-medium text-neutral-400">
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
            <div className="mt-8 flex justify-center gap-1.5">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all ${
                    current === index
                      ? "w-8 bg-school-green"
                      : "w-2 bg-neutral-200 hover:bg-neutral-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
