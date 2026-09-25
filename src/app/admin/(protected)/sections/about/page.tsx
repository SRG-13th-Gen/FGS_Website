import { aboutContent } from "@/lib/wordpress/sections/content";

import { AboutForm } from "./about-form";

export default async function AdminAboutSectionPage() {
  const initial = await aboutContent.get();

  return (
    <div className="space-y-1">
      <p className="text-sm text-neutral-500">
        Covers the Montessori quote band, the classroom photo banner, and the
        About Us section — in the order they appear on the homepage.
      </p>
      <div className="pt-5">
        <AboutForm initial={initial} />
      </div>
    </div>
  );
}
