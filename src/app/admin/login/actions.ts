"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  createDevSessionToken,
  getSessionCookieOptions,
  isDevLoginAvailable,
  SESSION_COOKIE_NAME,
  verifyDevCredentials,
} from "@/lib/auth/dev-login";

export interface LoginActionState {
  error: string | null;
}

export async function signInAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  if (!isDevLoginAvailable()) {
    return { error: "Admin sign-in is not configured yet." };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const matchedEmail = verifyDevCredentials(email, password);
  if (!matchedEmail) {
    return { error: "Incorrect email or password." };
  }

  const token = createDevSessionToken(matchedEmail);
  const host = (await headers()).get("host");
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(host));

  redirect("/admin");
}
