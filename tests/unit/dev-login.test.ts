import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createDevSessionToken,
  isDevLoginAvailable,
  SESSION_MAX_AGE_SECONDS,
  verifyDevCredentials,
  verifyDevSessionToken,
} from "@/lib/auth/dev-login";

const SYNTHETIC_EMAIL = "dev-admin@example.test";
const SYNTHETIC_PASSWORD = "synthetic-test-password";
const SYNTHETIC_SECRET = "synthetic-test-session-secret";

describe("dev-login production guard", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is available outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(isDevLoginAvailable()).toBe(true);
  });

  it("is never available in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isDevLoginAvailable()).toBe(false);
  });

  it("refuses credential checks in production even with valid configuration", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_DEV_EMAIL", SYNTHETIC_EMAIL);
    vi.stubEnv("ADMIN_DEV_PASSWORD", SYNTHETIC_PASSWORD);

    expect(
      verifyDevCredentials(SYNTHETIC_EMAIL, SYNTHETIC_PASSWORD),
    ).toBeNull();
  });
});

describe("verifyDevCredentials", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ADMIN_DEV_EMAIL", SYNTHETIC_EMAIL);
    vi.stubEnv("ADMIN_DEV_PASSWORD", SYNTHETIC_PASSWORD);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts the configured email case-insensitively with the exact password", () => {
    expect(
      verifyDevCredentials(SYNTHETIC_EMAIL.toUpperCase(), SYNTHETIC_PASSWORD),
    ).toBe(SYNTHETIC_EMAIL);
  });

  it("rejects an incorrect password", () => {
    expect(verifyDevCredentials(SYNTHETIC_EMAIL, "wrong-password")).toBeNull();
  });

  it("rejects an incorrect email", () => {
    expect(
      verifyDevCredentials("someone-else@example.test", SYNTHETIC_PASSWORD),
    ).toBeNull();
  });

  it("rejects when credentials are not configured", () => {
    vi.stubEnv("ADMIN_DEV_EMAIL", "");
    vi.stubEnv("ADMIN_DEV_PASSWORD", "");
    expect(
      verifyDevCredentials(SYNTHETIC_EMAIL, SYNTHETIC_PASSWORD),
    ).toBeNull();
  });
});

describe("session token sign/verify", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ADMIN_DEV_SESSION_SECRET", SYNTHETIC_SECRET);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("verifies a freshly created token and returns its payload", () => {
    const token = createDevSessionToken(SYNTHETIC_EMAIL);
    const payload = verifyDevSessionToken(token);
    expect(payload?.email).toBe(SYNTHETIC_EMAIL);
  });

  it("rejects a tampered payload", () => {
    const token = createDevSessionToken(SYNTHETIC_EMAIL);
    const [encodedPayload, signature] = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ email: "attacker@example.test", exp: 9999999999 }),
    ).toString("base64url");
    expect(verifyDevSessionToken(`${tamperedPayload}.${signature}`)).toBeNull();
    // Sanity check the original still verifies (the fixture wasn't broken).
    expect(
      verifyDevSessionToken(`${encodedPayload}.${signature}`),
    ).not.toBeNull();
  });

  it("rejects a tampered signature", () => {
    const token = createDevSessionToken(SYNTHETIC_EMAIL);
    const [encodedPayload] = token.split(".");
    expect(
      verifyDevSessionToken(`${encodedPayload}.not-a-valid-signature`),
    ).toBeNull();
  });

  it("rejects a malformed token", () => {
    expect(verifyDevSessionToken("not-a-token")).toBeNull();
    expect(verifyDevSessionToken(undefined)).toBeNull();
  });

  it("rejects an expired token", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = createDevSessionToken(SYNTHETIC_EMAIL);

    vi.setSystemTime(
      new Date(
        new Date("2026-01-01T00:00:00Z").getTime() +
          (SESSION_MAX_AGE_SECONDS + 1) * 1000,
      ),
    );

    expect(verifyDevSessionToken(token)).toBeNull();
  });

  it("accepts a token that has not yet expired", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = createDevSessionToken(SYNTHETIC_EMAIL);

    vi.setSystemTime(
      new Date(
        new Date("2026-01-01T00:00:00Z").getTime() +
          (SESSION_MAX_AGE_SECONDS - 1) * 1000,
      ),
    );

    expect(verifyDevSessionToken(token)?.email).toBe(SYNTHETIC_EMAIL);
  });
});
