import { schoolInfoContent } from "@/lib/wordpress/sections/content";

import { SchoolInfoForm } from "./school-info-form";

export default async function AdminSchoolInfoSectionPage() {
  const initial = await schoolInfoContent.get();

  return (
    <div className="space-y-1">
      <p className="text-sm text-neutral-500">
        Feeds the site navbar, footer, and article pages across the whole site.
      </p>
      <div className="pt-5">
        <SchoolInfoForm initial={initial} />
      </div>
    </div>
  );
}
