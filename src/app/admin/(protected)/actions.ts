"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME } from "@/lib/auth/dev-login";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function signOutAction() {
  await requireAdmin();

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  redirect("/admin/login");
}
