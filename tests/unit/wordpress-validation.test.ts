import { describe, expect, it } from "vitest";

import {
  MAX_IMAGE_BYTES,
  validateArticleFields,
  validateImageFile,
} from "@/lib/wordpress/validation";

const JPEG_HEADER = [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0];
const PNG_HEADER = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const TEXT_BYTES = [0x68, 0x65, 0x6c, 0x6c, 0x6f]; // "hello", not an image

function makeFile(bytes: number[], name = "test.jpg"): File {
  return new File([new Uint8Array(bytes)], name);
}

function makeOversizedJpeg(name = "big.jpg"): File {
  const buffer = new Uint8Array(MAX_IMAGE_BYTES + 1);
  buffer.set(JPEG_HEADER);
  return new File([buffer], name);
}

describe("validateArticleFields", () => {
  it("accepts a valid title/category/body", () => {
    const { data, fieldErrors } = validateArticleFields({
      title: "Foundation Day",
      category: "events",
      body: "Some body text.",
    });
    expect(fieldErrors).toEqual({});
    expect(data).toEqual({
      title: "Foundation Day",
      category: "events",
      body: "Some body text.",
    });
  });

  it("trims the title", () => {
    const { data } = validateArticleFields({
      title: "  Foundation Day  ",
      category: "events",
      body: "Body",
    });
    expect(data?.title).toBe("Foundation Day");
  });

  it("rejects a too-short title", () => {
    const { data, fieldErrors } = validateArticleFields({
      title: "Hi",
      category: "events",
      body: "Body",
    });
    expect(data).toBeNull();
    expect(fieldErrors.title).toBeTruthy();
  });

  it("rejects a title over 200 characters", () => {
    const { fieldErrors } = validateArticleFields({
      title: "x".repeat(201),
      category: "events",
      body: "Body",
    });
    expect(fieldErrors.title).toBeTruthy();
  });

  it("rejects a category outside the allowlist", () => {
    const { fieldErrors } = validateArticleFields({
      title: "Valid Title",
      category: "sports",
      body: "Body",
    });
    expect(fieldErrors.category).toBeTruthy();
  });

  it("rejects an empty or whitespace-only body", () => {
    const { fieldErrors } = validateArticleFields({
      title: "Valid Title",
      category: "clubs",
      body: "   ",
    });
    expect(fieldErrors.body).toBeTruthy();
  });
});

describe("validateImageFile", () => {
  it("accepts a real JPEG under the size limit", async () => {
    expect(await validateImageFile("id-1", makeFile(JPEG_HEADER))).toBeNull();
  });

  it("accepts a real PNG", async () => {
    expect(
      await validateImageFile("id-2", makeFile(PNG_HEADER, "test.png")),
    ).toBeNull();
  });

  it("rejects content that isn't a supported image, even with an image filename", async () => {
    const error = await validateImageFile(
      "id-3",
      makeFile(TEXT_BYTES, "fake.jpg"),
    );
    expect(error?.message).toMatch(/not a supported image type/);
  });

  it("rejects a file over the 10 MB limit", async () => {
    const error = await validateImageFile("id-4", makeOversizedJpeg());
    expect(error?.message).toMatch(/larger than 10 MB/);
  });

  it("rejects an empty file", async () => {
    const error = await validateImageFile("id-5", new File([], "empty.jpg"));
    expect(error?.message).toMatch(/empty or missing/);
  });
});
