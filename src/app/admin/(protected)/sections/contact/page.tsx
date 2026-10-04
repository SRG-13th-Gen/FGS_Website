import { requireAdmin } from "@/lib/auth/require-admin";
import { getSectionRevision } from "@/lib/content/sections/adapter";
import { contactContent } from "@/lib/content/sections/content";

import { ContactForm } from "./contact-form";

export default async function AdminContactSectionPage() {
  await requireAdmin();
  const revision = await getSectionRevision("site-contact");
  const initial = await contactContent.get();

  return (
    <div className="space-y-1">
      <p className="text-sm text-neutral-500">
        Fields appear in the same order as on the homepage Contact section.
      </p>
      <div className="pt-5">
        <ContactForm initial={initial} revision={revision} />
      </div>
    </div>
  );
}
