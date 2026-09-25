"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";

import { getAdminPageTitle } from "./admin-nav";

export function AdminTopbar({
  email,
  signOutAction,
}: {
  email: string;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const title = getAdminPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-neutral-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      <SidebarTrigger className="-ml-1" aria-label="Toggle sidebar" />

      <h1 className="flex-1 truncate text-base font-semibold text-neutral-900">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 sm:inline-flex"
        >
          <span>View live site</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        <div className="flex items-center gap-2 border-l border-neutral-200 pl-3">
          <span className="hidden max-w-[10rem] truncate text-xs text-neutral-500 sm:inline lg:max-w-none">
            {email}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
