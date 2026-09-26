"use client";

import { signIn } from "next-auth/react";

export function LoginForm() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">
        Sign in with a school-approved Google account to manage the website.
      </p>
      <button
        type="button"
        onClick={() => void signIn("google", { callbackUrl: "/admin" })}
        className="inline-flex w-full items-center justify-center rounded-xl bg-school-green px-4 py-3 text-sm font-semibold text-white hover:bg-school-green-dark"
      >
        Continue with Google
      </button>
    </div>
  );
}
