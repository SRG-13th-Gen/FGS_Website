import { requireAdmin } from "@/lib/auth/require-admin";
import { getSectionRevision } from "@/lib/content/sections/adapter";
import { alumniContent } from "@/lib/content/sections/content";

import { AlumniForm } from "./alumni-form";

export default async function AdminAlumniSectionPage() {
  await requireAdmin();
  const revision = await getSectionRevision("site-alumni");
  const initial = await alumniContent.get();

  return (
    <div className="space-y-1">
      <p className="text-sm text-neutral-500">
        Fields appear in the same order as on the Alumni page. A photo is
        optional for each achievement.
      </p>
      <div className="pt-5">
        <AlumniForm initial={initial} revision={revision} />
      </div>
    </div>
  );
}
