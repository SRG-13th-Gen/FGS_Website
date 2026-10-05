import Image from "next/image";

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
        <li
          key={index}
          className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
        >
          {item.image && (
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
              <Image
                src={item.image.url}
                alt={item.image.alt}
                fill
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col p-6">
            <span className="mb-2 inline-block w-fit rounded-full bg-school-green-light px-3 py-0.5 text-xs font-semibold text-school-green-dark">
              {item.batch}
            </span>
            <h3 className="text-base font-bold text-neutral-900">
              {item.name}
            </h3>
            <p className="mt-1 text-sm font-semibold text-school-green-dark">
              {item.title}
            </p>
            {item.description && (
              <p className="mt-2 text-sm text-neutral-600">
                {item.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
