import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { isGoogleSignInConfigured } from "@/lib/auth/options";
import { getAdminSession } from "@/lib/auth/require-admin";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin Sign In | Flor de Grace School Inc.",
  description: "Sign in to the Flor de Grace School admin portal.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }
  const { error } = await searchParams;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-neutral-50 px-4 py-12 sm:px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/images/logo/fgs-logo-website-1.webp"
            alt="Flor de Grace School"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
            priority
          />
          <h1 className="mt-4 text-xl font-bold tracking-tight text-neutral-900">
            Flor de Grace School
          </h1>
          <p className="mt-1 text-sm text-neutral-500">Admin Portal Sign In</p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-8">
          {error ? (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              Sign-in was not accepted. Use an approved school Google account or
              contact the school administrator.
            </p>
          ) : null}
          {isGoogleSignInConfigured() ? (
            <LoginForm />
          ) : (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              Admin sign-in is not configured yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
