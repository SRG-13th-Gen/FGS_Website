// TEMPORARY: seeded local-only admin login used while DEC-103 (managed OIDC
// team sign-in) is on hold. Replace this module, the requireAdmin()
// internals in require-admin.ts, and the /admin/login page with the accepted
// DEC-103 provider before any deployment. Do not extend this module with
// rate limiting, lockout, roles, or an allowlist — those belong to DEC-103.

import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "fgs_admin_dev_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export interface DevSessionPayload {
  email: string;
  exp: number;
}

/** Dev login only ever runs outside production; production always denies access. */
export function isDevLoginAvailable(): boolean {
  return process.env.NODE_ENV !== "production";
}

function constantTimeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    // Compare against itself so a length mismatch takes a similar amount of
    // time as a same-length mismatch, rather than returning immediately.
    timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

/**
 * Checks email/password against ADMIN_DEV_EMAIL / ADMIN_DEV_PASSWORD.
 * Returns the canonical configured email on success, or null on any failure
 * (including missing configuration) without distinguishing the reason.
 */
export function verifyDevCredentials(
  emailInput: string,
  passwordInput: string,
): string | null {
  if (!isDevLoginAvailable()) return null;

  const configuredEmail = process.env.ADMIN_DEV_EMAIL;
  const configuredPassword = process.env.ADMIN_DEV_PASSWORD;
  if (!configuredEmail || !configuredPassword) return null;

  const emailMatches =
    emailInput.trim().toLowerCase() === configuredEmail.trim().toLowerCase();
  const passwordMatches = constantTimeEqual(passwordInput, configuredPassword);

  return emailMatches && passwordMatches ? configuredEmail : null;
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_DEV_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_DEV_SESSION_SECRET is not configured.");
  }
  return secret;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createDevSessionToken(email: string): string {
  const payload: DevSessionPayload = {
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const signature = sign(encodedPayload, getSessionSecret());
  return `${encodedPayload}.${signature}`;
}

/** Verifies signature and expiry; returns the decoded payload or null. */
export function verifyDevSessionToken(
  token: string | undefined,
): DevSessionPayload | null {
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  let expectedSignature: string;
  try {
    expectedSignature = sign(encodedPayload, getSessionSecret());
  } catch {
    return null;
  }

  if (!constantTimeEqual(signature, expectedSignature)) return null;

  let payload: DevSessionPayload;
  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
  } catch {
    return null;
  }

  if (typeof payload.email !== "string" || typeof payload.exp !== "number") {
    return null;
  }
  if (payload.exp <= Math.floor(Date.now() / 1000)) return null;

  return payload;
}

function isLocalHost(host: string | null): boolean {
  if (!host) return false;
  const hostname = host.split(":")[0];
  return (
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1"
  );
}

/** `secure` is only relaxed for localhost so the cookie still works over plain http in dev. */
export function getSessionCookieOptions(host: string | null) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: !isLocalHost(host),
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
