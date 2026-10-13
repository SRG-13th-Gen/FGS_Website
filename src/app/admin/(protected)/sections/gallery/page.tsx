import { requireAdmin } from "@/lib/auth/require-admin";
import { getSectionRevision } from "@/lib/content/sections/adapter";
import { galleryContent } from "@/lib/content/sections/content";

import { GalleryForm } from "./gallery-form";

export default async function AdminGallerySectionPage() {
  await requireAdmin();
  const revision = await getSectionRevision("site-gallery");
  const initial = await galleryContent.get();

  return (
    <div className="flex flex-1 flex-col space-y-4">
      <p className="text-sm text-neutral-500">
        Fields appear in the same order as on the homepage Gallery section.
      </p>
      <div className="flex flex-1 flex-col">
        <GalleryForm initial={initial} revision={revision} />
      </div>
    </div>
  );
}
