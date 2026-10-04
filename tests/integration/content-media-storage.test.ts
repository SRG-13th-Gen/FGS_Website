import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";

const mocks = vi.hoisted(() => ({
  rows: vi.fn(),
  mutate: vi.fn(),
  write: vi.fn(),
}));
vi.mock("@/lib/content/db", () => ({ rows: mocks.rows, mutate: mocks.mutate }));
vi.mock("node:fs/promises", async (importOriginal) => {
  const fs = await importOriginal<typeof import("node:fs/promises")>();
  mocks.write.mockImplementation(fs.writeFile);
  return { ...fs, writeFile: mocks.write };
});
import { uploadMedia } from "@/lib/content/media";

const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
const hash = createHash("sha256").update(png).digest("hex");
let directory: string;
let target: string;
const file = () => new File([png], "school.png", { type: "image/png" });

beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "fgs-storage-test-"));
  vi.stubEnv("MEDIA_STORAGE_PATH", directory);
  target = path.join(directory, hash.slice(0, 2), hash + ".png");
  await mkdir(path.dirname(target));
  mocks.rows.mockReset().mockResolvedValue([{ id: 1 }]);
  mocks.mutate.mockReset();
  mocks.write.mockClear();
});
afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(directory, { recursive: true, force: true });
});

describe("immutable media publication", () => {
  it("repairs a partial file left by an interrupted legacy upload", async () => {
    await writeFile(target, png.subarray(0, 8));
    expect(await uploadMedia(file(), "School")).toMatchObject({ mediaId: 1 });
    expect(await readFile(target)).toEqual(png);
    expect(await readdir(path.dirname(target))).toEqual([hash + ".png"]);
  });
  it("reuses complete files without rewriting them", async () => {
    await writeFile(target, png);
    mocks.write.mockClear();
    await uploadMedia(file(), "School");
    expect(mocks.write).not.toHaveBeenCalled();
    expect(await readFile(target)).toEqual(png);
  });
  it("allows identical concurrent uploads to publish complete bytes", async () => {
    const uploads = await Promise.all(
      Array.from({ length: 8 }, () => uploadMedia(file(), "School")),
    );
    expect(uploads.every((item) => item.mediaId === 1)).toBe(true);
    expect(await readFile(target)).toEqual(png);
    expect(await readdir(path.dirname(target))).toEqual([hash + ".png"]);
  });
  it("cleans up failed temporary writes and allows retry", async () => {
    const fs =
      await vi.importActual<typeof import("node:fs/promises")>(
        "node:fs/promises",
      );
    mocks.write.mockImplementationOnce(async (destination, bytes) => {
      await fs.writeFile(destination, bytes.subarray(0, 8));
      throw new Error("Simulated interrupted write");
    });
    await expect(uploadMedia(file(), "School")).rejects.toThrow(
      "Simulated interrupted write",
    );
    expect(await readdir(path.dirname(target))).toEqual([]);
    expect(mocks.rows).not.toHaveBeenCalled();
    await uploadMedia(file(), "School");
    expect(await readFile(target)).toEqual(png);
  });
});
