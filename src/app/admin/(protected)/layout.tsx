import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminShell } from "@/components/admin/admin-shell";

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
    <AdminShell email={session.email} signOutAction={signOutAction}>
      {children}
    </AdminShell>
  );
}
