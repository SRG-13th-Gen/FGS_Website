import { describe, expect, it } from "vitest";
import { parseServerEnvironment } from "@/lib/env/schema";
describe("content environment", () => {
  it("permits an unconfigured scaffold without secrets", () =>
    expect(parseServerEnvironment({})).toEqual({ DB_PORT: 3306 }));
  it("does not forward integration credentials", () =>
    expect(
      parseServerEnvironment({ HOSTINGER_API_TOKEN: "synthetic" }),
    ).toEqual({ DB_PORT: 3306 }));
  it("treats empty credentials as absent", () =>
    expect(
      parseServerEnvironment({ DB_PASSWORD: "" }).DB_PASSWORD,
    ).toBeUndefined());
  it.each(["0", "65536", "invalid"])(
    "rejects invalid database ports without exposing secrets: %s",
    (DB_PORT) =>
      expect(() =>
        parseServerEnvironment({ DB_PORT, DB_PASSWORD: "private" }),
      ).toThrow("Invalid server environment: DB_PORT"),
  );
  it("requires absolute production media storage", () =>
    expect(() =>
      parseServerEnvironment({
        NODE_ENV: "production",
        MEDIA_STORAGE_PATH: "relative",
      }),
    ).toThrow("MEDIA_STORAGE_PATH must be absolute"));
});
