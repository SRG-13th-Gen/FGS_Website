import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  upload: vi.fn(),
  saveAlumni: vi.fn(),
  saveGallery: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: mocks.requireAdmin,
}));
vi.mock("@/lib/content/sections/adapter", () => ({
  checkSectionRevision: vi.fn().mockResolvedValue(null),
  zodIssuesToFieldErrors: (error: {
    issues: { path: PropertyKey[]; message: string }[];
  }) =>
    Object.fromEntries(error.issues.map((i) => [i.path.join("."), i.message])),
}));
vi.mock("@/lib/content/sections/media", () => ({
  uploadSectionImage: mocks.upload,
}));
vi.mock("@/lib/content/sections/content", async () => {
  const { alumniSchema } = await import("@/lib/content/sections/alumni");
  const { gallerySchema } = await import("@/lib/content/sections/gallery");
  return {
    alumniContent: { schema: alumniSchema, save: mocks.saveAlumni },
    galleryContent: { schema: gallerySchema, save: mocks.saveGallery },
  };
});
vi.mock("next/cache", () => ({ revalidatePath: mocks.refresh }));

import { saveAlumniAction } from "@/app/admin/(protected)/sections/alumni/actions";
import { saveGalleryAction } from "@/app/admin/(protected)/sections/gallery/actions";

const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0];
const jpeg = () => new File([new Uint8Array(JPEG)], "photo.jpg");

const alumniForm = (withFile: boolean, mediaId: number) => {
  const f = new FormData();
  f.set("revision", "2");
  f.set("sectionLabel", "Alumni");
  f.set("heading", "Alumni Achievements");
  f.set("intro", "");
  f.set(
    "achievementsJson",
    JSON.stringify([
      {
        name: "Maria Santos",
        batch: "Batch 2015",
        title: "Award",
        description: "",
        image: { mediaId, alt: "Maria" },
      },
    ]),
  );
  if (withFile) f.set("achievementFile-0", jpeg());
  return f;
};

const galleryForm = (withFile: boolean, mediaId: number) => {
  const f = new FormData();
  f.set("revision", "2");
  f.set("sectionLabel", "Gallery");
  f.set("heading", "Life at FGS");
  f.set("intro", "");
  f.set(
    "photosJson",
    JSON.stringify([{ mediaId, alt: "Field day", caption: "" }]),
  );
  if (withFile) f.set("photoFile-0", jpeg());
  return f;
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ email: "approved@example.test" });
  mocks.upload.mockResolvedValue({ mediaId: 77 });
  const ok = { status: "success", cacheWarning: false, revision: 3 };
  mocks.saveAlumni.mockResolvedValue(ok);
  mocks.saveGallery.mockResolvedValue(ok);
});

describe.each([
  ["alumni", saveAlumniAction, alumniForm, () => mocks.saveAlumni],
  ["gallery", saveGalleryAction, galleryForm, () => mocks.saveGallery],
] as const)("%s save with a new upload", (_name, action, build, saveMock) => {
  it("reports the stored media id for the uploaded slot", async () => {
    const result = await action(null, build(true, 0));
    expect(mocks.upload).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      status: "success",
      uploadedMedia: { 0: 77 },
    });
  });

  it("does not upload again when the form resubmits the saved reference", async () => {
    await action(null, build(true, 0));
    mocks.upload.mockClear();
    // After applySavedUploads the form sends mediaId 77 and no file.
    const result = await action(null, build(false, 77));
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(result).toMatchObject({ status: "success", uploadedMedia: {} });
    expect(JSON.stringify(saveMock().mock.calls.at(-1)?.[0])).toContain(
      '"mediaId":77',
    );
  });
});
