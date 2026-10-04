import { requireAdmin } from "@/lib/auth/require-admin";
import { getSectionRevision } from "@/lib/content/sections/adapter";
import { schoolInfoContent } from "@/lib/content/sections/content";

import { SchoolInfoForm } from "./school-info-form";

export default async function AdminSchoolInfoSectionPage() {
  await requireAdmin();
  const revision = await getSectionRevision("site-school-info");
  const initial = await schoolInfoContent.get();

  return (
    <div className="space-y-1">
      <p className="text-sm text-neutral-500">
        Feeds the site navbar, footer, and article pages across the whole site.
      </p>
      <div className="pt-5">
        <SchoolInfoForm initial={initial} revision={revision} />
      </div>
    </div>
  );
}
