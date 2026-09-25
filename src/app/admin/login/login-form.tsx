"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Info, Loader2 } from "lucide-react";

import { signInAction, type LoginActionState } from "./actions";

const initialState: LoginActionState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="flex items-start gap-2 rounded-xl border border-school-yellow/40 bg-school-yellow-light px-3 py-2.5 text-xs text-neutral-700">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-500" />
        <p>
          <span className="font-semibold">Development login.</span> Temporary
          seeded credentials for local admin work only. This will be replaced by
          the school&apos;s managed sign-in.
        </p>
      </div>

      <div>
        <label
          htmlFor="admin-email"
          className="block text-sm font-bold text-neutral-800"
        >
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-school-green focus:bg-white focus:ring-2 focus:ring-school-green/20 focus:outline-none"
          placeholder="admin@fgs.local"
        />
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="block text-sm font-bold text-neutral-800"
        >
          Password
        </label>
        <div className="relative mt-2">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-2.5 pr-11 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-school-green focus:bg-white focus:ring-2 focus:ring-school-green/20 focus:outline-none"
            placeholder="********"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-neutral-400 transition-colors hover:text-neutral-700 focus-visible:text-neutral-700 focus-visible:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div aria-live="polite">
        {state.error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {state.error}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-school-green py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-school-green-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign in</span>
        )}
      </button>

      {/* Real Google/OIDC sign-in (DEC-103) will be added here once the
          school's Google account and managed OIDC provider are available. */}
    </form>
  );
}
