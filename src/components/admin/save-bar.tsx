"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function SaveBar({
  isDirty,
  isPending,
  onDiscard,
  viewHref,
}: {
  isDirty: boolean;
  isPending: boolean;
  onDiscard: () => void;
  viewHref?: string;
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-neutral-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        {viewHref ? (
          <Link
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-school-green hover:underline"
          >
            <span>View this section on the site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span />
        )}

        <div className="ml-auto flex items-center gap-2.5">
          <button
            type="button"
            onClick={onDiscard}
            disabled={!isDirty || isPending}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={!isDirty || isPending}
            className="rounded-xl bg-school-green px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-school-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
