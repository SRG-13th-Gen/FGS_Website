import { galleryContent } from "@/lib/wordpress/sections/content";

import { GalleryForm } from "./gallery-form";

export default async function AdminGallerySectionPage() {
  const initial = await galleryContent.get();

  return (
    <div className="space-y-1">
      <p className="text-sm text-neutral-500">
        Fields appear in the same order as on the homepage Gallery section.
      </p>
      <div className="pt-5">
        <GalleryForm initial={initial} />
      </div>
    </div>
  );
}
