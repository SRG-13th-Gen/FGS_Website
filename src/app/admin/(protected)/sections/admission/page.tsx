import { admissionContent } from "@/lib/wordpress/sections/content";

import { AdmissionForm } from "./admission-form";

export default async function AdminAdmissionSectionPage() {
  const initial = await admissionContent.get();

  return (
    <div className="space-y-1">
      <p className="text-sm text-neutral-500">
        Fields appear in the same order as on the homepage Admission section.
      </p>
      <div className="pt-5">
        <AdmissionForm initial={initial} />
      </div>
    </div>
  );
}
