import { requireAdmin } from "@/lib/auth/require-admin";
import { getSectionRevision } from "@/lib/content/sections/adapter";
import { heroContent } from "@/lib/content/sections/content";

import { HeroForm } from "./hero-form";

export default async function AdminHeroSectionPage() {
  await requireAdmin();
  const revision = await getSectionRevision("site-hero");
  const initial = await heroContent.get();

  return (
    <div className="space-y-1">
      <p className="text-sm text-neutral-500">
        The first thing visitors see. Fields appear in the same order as on the
        homepage.
      </p>
      <div className="pt-5">
        <HeroForm initial={initial} revision={revision} />
      </div>
    </div>
  );
}
