import { requireAdmin } from "@/lib/auth/require-admin";
import { getSectionRevision } from "@/lib/content/sections/adapter";
import { admissionContent } from "@/lib/content/sections/content";

import { AdmissionForm } from "./admission-form";

export default async function AdminAdmissionSectionPage() {
  await requireAdmin();
  const revision = await getSectionRevision("site-admission");
  const initial = await admissionContent.get();

  return (
    <div className="space-y-1">
      <p className="text-sm text-neutral-500">
        Fields appear in the same order as on the homepage Admission section.
      </p>
      <div className="pt-5">
        <AdmissionForm initial={initial} revision={revision} />
      </div>
    </div>
  );
}
