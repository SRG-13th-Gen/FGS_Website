import { describe, expect, it } from "vitest";

import { parseServerEnvironment } from "@/lib/env/schema";

describe("server environment", () => {
  it("allows starting the local scaffold before CMS credentials are configured", () => {
    expect(parseServerEnvironment({ NODE_ENV: "development" })).toEqual({
      WORDPRESS_URL: "http://localhost:8080",
    });
  });

  it("treats empty optional credentials as unconfigured", () => {
    expect(
      parseServerEnvironment({ WORDPRESS_APPLICATION_PASSWORD: "" })
        .WORDPRESS_APPLICATION_PASSWORD,
    ).toBeUndefined();
  });

  it.each([
    "ftp://example.test",
    "https://user:secret@example.test",
    "https://example.test?token=secret",
    "https://example.test#secret",
    "not-a-url",
  ])("rejects unsafe CMS configuration without echoing it: %s", (value) => {
    expect(() => parseServerEnvironment({ WORDPRESS_URL: value })).toThrow(
      "Invalid server environment: WORDPRESS_URL",
    );
  });

  it("requires an explicit production CMS URL", () => {
    expect(() => parseServerEnvironment({ NODE_ENV: "production" })).toThrow(
      "Invalid server environment: WORDPRESS_URL",
    );
  });

  it("rejects insecure production transport", () => {
    expect(() =>
      parseServerEnvironment({
        NODE_ENV: "production",
        WORDPRESS_URL: "http://cms.example.test",
      }),
    ).toThrow("WORDPRESS_URL must use HTTPS in production.");
  });

  it("does not forward unrelated environment values", () => {
    expect(
      parseServerEnvironment({
        NODE_ENV: "production",
        WORDPRESS_URL: "https://cms.example.test",
        MARIADB_ROOT_PASSWORD: "synthetic-secret",
      }),
    ).toEqual({ WORDPRESS_URL: "https://cms.example.test" });
  });
});
