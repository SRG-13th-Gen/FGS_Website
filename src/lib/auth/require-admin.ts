import "server-only";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { isApprovedAdminEmail } from "@/lib/auth/allowlist";
import { authOptions, isGoogleSignInConfigured } from "@/lib/auth/options";

export interface AdminSession {
  email: string;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isGoogleSignInConfigured()) return null;
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    // Recheck on every protected read/action so allowlist revocation takes
    // effect without waiting for an eight-hour session to expire.
    if (!isApprovedAdminEmail(email)) return null;
    return { email: email! };
  } catch {
    return null;
  }
}

/** Call in every protected admin layout, server action, and route handler. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
