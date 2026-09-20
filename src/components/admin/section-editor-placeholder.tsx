import Link from "next/link";
import { Construction } from "lucide-react";

/** Shown for sections whose editor hasn't been built yet (SPEC-007 work order). */
export function SectionEditorPlaceholder({
  label,
  publicAnchor,
}: {
  label: string;
  publicAnchor: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
      <Construction className="mx-auto h-8 w-8 text-neutral-400" />
      <h2 className="mt-3 text-base font-semibold text-neutral-900">
        {label} editor is not built yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500">
        This section already reads its content from WordPress on the public
        site, but its admin editor is scheduled for a later work step. Edit its
        content directly via the WordPress REST API or wp-admin custom fields in
        the meantime.
      </p>
      <Link
        href={publicAnchor}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-school-green hover:underline"
      >
        View this section on the site
      </Link>
    </div>
  );
}
