import { clubsContent } from "@/lib/wordpress/sections/content";

import { ClubsForm } from "./clubs-form";

export default async function AdminClubsSectionPage() {
  const initial = await clubsContent.get();

  return (
    <div className="space-y-1">
      <p className="text-sm text-neutral-500">
        Fields appear in the same order as on the homepage Clubs carousel.
      </p>
      <div className="pt-5">
        <ClubsForm initial={initial} />
      </div>
    </div>
  );
}
