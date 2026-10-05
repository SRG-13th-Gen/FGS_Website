import type { ReactNode } from "react";

/** Page header in the homepage section-header pattern, as the page's h1. */
export function AreaPageHeader({
  label,
  heading,
  intro,
}: {
  label: string;
  heading: string;
  intro?: string;
}) {
  return (
    <header>
      <span className="text-sm font-semibold tracking-widest text-school-green-dark uppercase">
        {label}
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        {heading}
      </h1>
      <div className="mt-3 h-1 w-16 rounded-full bg-school-green" />
      {intro && (
        <p className="mt-3 max-w-xl text-sm text-neutral-600 sm:text-base">
          {intro}
        </p>
      )}
    </header>
  );
}

/** Truthful empty or unavailable message, as used by the homepage sections. */
export function AreaNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-14 text-center">
      <p className="text-sm font-medium text-neutral-600">{children}</p>
    </div>
  );
}
