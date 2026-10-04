import { requireAdmin } from "@/lib/auth/require-admin";
import { getSectionRevision } from "@/lib/content/sections/adapter";
import { clubsContent } from "@/lib/content/sections/content";

import { ClubsForm } from "./clubs-form";

export default async function AdminClubsSectionPage() {
  await requireAdmin();
  const revision = await getSectionRevision("site-clubs");
  const initial = await clubsContent.get();

  return (
    <div className="space-y-1">
      <p className="text-sm text-neutral-500">
        Fields appear in the same order as on the homepage Clubs carousel.
      </p>
      <div className="pt-5">
        <ClubsForm initial={initial} revision={revision} />
      </div>
    </div>
  );
}
