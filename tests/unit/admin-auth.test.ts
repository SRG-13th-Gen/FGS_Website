import { afterEach, describe, expect, it, vi } from "vitest";

import { isApprovedAdminEmail } from "@/lib/auth/allowlist";

describe("exact administrator allowlist", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("accepts only complete approved addresses regardless of case", () => {
    const list = "Principal@school.example, office@school.example";
    expect(isApprovedAdminEmail("PRINCIPAL@SCHOOL.EXAMPLE", list)).toBe(true);
    expect(isApprovedAdminEmail("principal@other.example", list)).toBe(false);
    expect(isApprovedAdminEmail("xprincipal@school.example", list)).toBe(false);
  });

  it("denies empty, malformed, and revoked addresses", () => {
    expect(isApprovedAdminEmail("a@school.example", "")).toBe(false);
    expect(isApprovedAdminEmail("a@school.example", undefined)).toBe(false);
    expect(
      isApprovedAdminEmail("a@school.example,evil", "a@school.example"),
    ).toBe(false);
    vi.stubEnv("ADMIN_ALLOWED_EMAILS", "another@school.example");
    expect(isApprovedAdminEmail("a@school.example")).toBe(false);
  });
});
