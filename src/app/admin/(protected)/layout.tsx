import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, LogOut, ShieldCheck } from "lucide-react";

import { requireAdmin } from "@/lib/auth/require-admin";

import { signOutAction } from "./actions";

export const metadata: Metadata = {
  title: "Admin Portal | Flor de Grace School Inc.",
  description:
    "FGS Admin Portal for managing school articles, stories, and announcements.",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-neutral-50/70 text-neutral-900">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            >
              <Image
                src="/images/logo/fgs-logo-website-1.webp"
                alt="Flor de Grace School"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
                priority
              />
              <span className="font-semibold text-neutral-900">
                Flor de Grace School
              </span>
            </Link>
            <span className="hidden items-center gap-1 rounded-full bg-school-green/10 px-2.5 py-0.5 text-xs font-semibold text-school-green sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Portal
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            >
              <span>View Live Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <div className="flex items-center gap-2 border-l border-neutral-200 pl-3">
              <span className="max-w-[10rem] truncate text-xs text-neutral-500 sm:max-w-none">
                {session.email}
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
