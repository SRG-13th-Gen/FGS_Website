import { heroContent } from "@/lib/wordpress/sections/content";

import { HeroForm } from "./hero-form";

export default async function AdminHeroSectionPage() {
  const initial = await heroContent.get();

  return (
    <div className="space-y-1">
      <p className="text-sm text-neutral-500">
        The first thing visitors see. Fields appear in the same order as on the
        homepage.
      </p>
      <div className="pt-5">
        <HeroForm initial={initial} />
      </div>
    </div>
  );
}
