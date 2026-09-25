import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  isDevLoginAvailable,
  SESSION_COOKIE_NAME,
  verifyDevSessionToken,
} from "@/lib/auth/dev-login";

export interface AdminSession {
  email: string;
}

/**
 * Reads and verifies the admin session cookie. Returns null when there is no
 * valid session, including whenever dev login is unavailable (production).
 * When DEC-103 replaces the dev login, only this internals + dev-login.ts +
 * the login page change — callers keep using requireAdmin()/getAdminSession().
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isDevLoginAvailable()) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const payload = verifyDevSessionToken(token);
  if (!payload) return null;

  return { email: payload.email };
}

/** Call in every protected admin layout, server action, and route handler. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
