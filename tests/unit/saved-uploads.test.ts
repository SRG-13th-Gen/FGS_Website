import { describe, expect, it } from "vitest";

import {
  applySavedImage,
  applySavedUploads,
} from "@/components/admin/saved-uploads";

const file = new File([new Uint8Array([1])], "photo.jpg");
const slot = (mediaId: number, pendingFile: File | null) => ({
  mediaId,
  previewUrl: "blob:x",
  alt: "alt",
  pendingFile,
});

describe("applySavedUploads", () => {
  it("replaces a pending file with the stored media id", () => {
    const [saved] = applySavedUploads([slot(0, file)], { 0: 77 });
    expect(saved).toMatchObject({ mediaId: 77, pendingFile: null });
  });

  it("leaves slots without an upload unchanged", () => {
    const existing = slot(5, null);
    const pending = slot(0, file);
    const result = applySavedUploads([existing, pending], { 1: 9 });
    expect(result[0]).toBe(existing);
    expect(result[1]).toMatchObject({ mediaId: 9, pendingFile: null });
  });

  it("returns the items as they are when nothing was uploaded", () => {
    const items = [slot(0, file)];
    expect(applySavedUploads(items, undefined)).toBe(items);
    expect(applySavedUploads(items, {})[0].pendingFile).toBe(file);
  });

  it("never reports a pending file after the swap, so no file is resubmitted", () => {
    const result = applySavedUploads([slot(0, file), slot(0, file)], {
      0: 1,
      1: 2,
    });
    expect(result.every((item) => item.pendingFile === null)).toBe(true);
  });
});

describe("applySavedImage", () => {
  it("swaps the single pending image for its stored media id", () => {
    expect(applySavedImage(slot(0, file), { 0: 5 })).toMatchObject({
      mediaId: 5,
      pendingFile: null,
    });
  });

  it("keeps an image that was not uploaded", () => {
    const image = slot(8, null);
    expect(applySavedImage(image, undefined)).toBe(image);
  });
});
