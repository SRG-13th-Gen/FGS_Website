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
      <span className="inline-flex items-center gap-2 rounded-full border border-school-green/20 bg-school-green/5 px-3.5 py-1 text-xs font-bold tracking-widest text-school-green-dark uppercase shadow-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-school-green" />
        {label}
      </span>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
        {heading}
      </h1>
      <div className="mt-3.5 h-1 w-20 rounded-full bg-gradient-to-r from-school-green to-school-green-light" />
      {intro && (
        <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
          {intro}
        </p>
      )}
    </header>
  );
}

/** Truthful empty or unavailable message, as used by the homepage sections. */
export function AreaNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-neutral-200/80 bg-neutral-50/80 px-6 py-14 text-center shadow-xs">
      <p className="text-sm font-medium text-neutral-600">{children}</p>
    </div>
  );
}
