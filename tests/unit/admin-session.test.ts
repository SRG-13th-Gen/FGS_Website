import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSession } = vi.hoisted(() => ({ getServerSession: vi.fn() }));
vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("redirect");
  }),
}));

const { getAdminSession, requireAdmin } =
  await import("@/lib/auth/require-admin");
const { authOptions } = await import("@/lib/auth/options");

describe("administrator session gate", () => {
  beforeEach(() => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "synthetic-client");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "synthetic-secret");
    vi.stubEnv("NEXTAUTH_SECRET", "synthetic-session-secret");
    vi.stubEnv("ADMIN_ALLOWED_EMAILS", "admin@school.example");
    getServerSession.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("denies sessions when OAuth configuration is incomplete", async () => {
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");
    expect(await getAdminSession()).toBeNull();
    expect(getServerSession).not.toHaveBeenCalled();
  });

  it("rechecks an existing session against the current allowlist", async () => {
    getServerSession.mockResolvedValue({
      user: { email: "admin@school.example" },
    });
    expect(await getAdminSession()).toEqual({ email: "admin@school.example" });
    vi.stubEnv("ADMIN_ALLOWED_EMAILS", "other@school.example");
    expect(await getAdminSession()).toBeNull();
    await expect(requireAdmin()).rejects.toThrow("redirect");
  });

  it("rejects unverified and uninvited Google profiles", async () => {
    const signIn = authOptions.callbacks!.signIn!;
    const base = { account: { provider: "google" }, user: { id: "1" } };
    expect(
      await signIn({
        ...base,
        profile: { email: "admin@school.example", email_verified: false },
      } as never),
    ).toBe(false);
    expect(
      await signIn({
        ...base,
        profile: { email: "other@school.example", email_verified: true },
      } as never),
    ).toBe(false);
    expect(
      await signIn({
        ...base,
        profile: { email: "admin@school.example", email_verified: true },
      } as never),
    ).toBe(true);
  });
});
