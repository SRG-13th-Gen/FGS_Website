import Image from "next/image";
import { Award } from "lucide-react";

import { Reveal } from "@/components/public/reveal";
import type { AlumniAchievementView } from "@/lib/content/sections/alumni";

/** Achievements grid. A card without a photo renders without an image area. */
export function AlumniAchievements({
  achievements,
}: {
  achievements: AlumniAchievementView[];
}) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((item, index) => (
        <Reveal as="li" key={index} step={index % 3} className="h-full">
          <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-school-green/50 hover:shadow-xl">
            {item.image && (
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                <Image
                  src={item.image.url}
                  alt={item.image.alt}
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-20" />
              </div>
            )}
            <div className="flex flex-1 flex-col p-6 sm:p-7">
              <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-3 py-0.5 text-xs font-bold tracking-wider text-amber-800 uppercase shadow-xs">
                <Award className="h-3.5 w-3.5 text-amber-600" />
                {item.batch}
              </span>
              <h3 className="text-lg font-bold text-neutral-900 transition-colors group-hover:text-school-green">
                {item.name}
              </h3>
              <p className="mt-1 text-sm font-semibold text-school-green-dark">
                {item.title}
              </p>
              {item.description && (
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </Reveal>
      ))}
    </ul>
  );
}
