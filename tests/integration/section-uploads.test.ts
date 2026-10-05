import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  upload: vi.fn(),
  saveAlumni: vi.fn(),
  saveGallery: vi.fn(),
  saveHero: vi.fn(),
  saveAbout: vi.fn(),
  saveAdmission: vi.fn(),
  saveSchoolInfo: vi.fn(),
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
  const { heroSchema } = await import("@/lib/content/sections/hero");
  const { aboutSchema } = await import("@/lib/content/sections/about");
  const { admissionSchema } = await import("@/lib/content/sections/admission");
  const { schoolInfoSchema } =
    await import("@/lib/content/sections/school-info");
  return {
    heroContent: { schema: heroSchema, save: mocks.saveHero },
    aboutContent: { schema: aboutSchema, save: mocks.saveAbout },
    admissionContent: { schema: admissionSchema, save: mocks.saveAdmission },
    schoolInfoContent: {
      schema: schoolInfoSchema,
      save: mocks.saveSchoolInfo,
    },
    alumniContent: { schema: alumniSchema, save: mocks.saveAlumni },
    galleryContent: { schema: gallerySchema, save: mocks.saveGallery },
  };
});
vi.mock("next/cache", () => ({ revalidatePath: mocks.refresh }));

import { saveAlumniAction } from "@/app/admin/(protected)/sections/alumni/actions";
import { saveHeroAction } from "@/app/admin/(protected)/sections/hero/actions";
import { saveAboutAction } from "@/app/admin/(protected)/sections/about/actions";
import { saveAdmissionAction } from "@/app/admin/(protected)/sections/admission/actions";
import { saveSchoolInfoAction } from "@/app/admin/(protected)/sections/school-info/actions";
import { ABOUT_DEFAULTS } from "@/lib/content/sections/about";
import { ADMISSION_DEFAULTS } from "@/lib/content/sections/admission";
import { HERO_DEFAULTS } from "@/lib/content/sections/hero";
import { SCHOOL_INFO_DEFAULTS } from "@/lib/content/sections/school-info";
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
  mocks.saveHero.mockResolvedValue(ok);
  mocks.saveAbout.mockResolvedValue(ok);
  mocks.saveAdmission.mockResolvedValue(ok);
  mocks.saveSchoolInfo.mockResolvedValue(ok);
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

// The single-image editors: the file field and media id field differ by editor.
const imageFields = (
  f: FormData,
  prefix: string,
  withFile: boolean,
  mediaId: number,
) => {
  f.set(prefix + "MediaId", String(mediaId));
  f.set(prefix + "Alt", "Alt text");
  if (withFile) f.set(prefix + "File", jpeg());
};

const heroForm = (withFile: boolean, mediaId: number) => {
  const f = new FormData();
  f.set("revision", "2");
  f.set("heading", HERO_DEFAULTS.heading);
  f.set("tagline", HERO_DEFAULTS.tagline);
  imageFields(f, "backgroundImage", withFile, mediaId);
  return f;
};

const aboutForm = (withFile: boolean, mediaId: number) => {
  const d = ABOUT_DEFAULTS;
  const f = new FormData();
  f.set("revision", "2");
  f.set("sectionLabel", d.sectionLabel);
  f.set("heading", d.heading);
  for (const paragraph of d.storyParagraphs)
    f.append("storyParagraphs", paragraph);
  f.set("mission", d.mission);
  f.set("vision", d.vision);
  f.set("quoteText", d.quote.text);
  f.set("quoteAuthor", d.quote.author);
  f.set("bannerHeading", d.featureBanner.heading);
  f.set("bannerBody", d.featureBanner.body);
  imageFields(f, "bannerImage", withFile, mediaId);
  return f;
};

const admissionForm = (withFile: boolean, mediaId: number) => {
  const d = ADMISSION_DEFAULTS;
  const f = new FormData();
  f.set("revision", "2");
  f.set("sectionLabel", d.sectionLabel);
  f.set("heading", d.heading);
  f.set("intro", d.intro);
  f.set("programsJson", JSON.stringify(d.programs));
  f.set("requirementCategoriesJson", JSON.stringify(d.requirementCategories));
  f.set("enrollmentStepsJson", JSON.stringify(d.enrollmentSteps));
  imageFields(f, "backgroundImage", withFile, mediaId);
  return f;
};

const schoolInfoForm = (withFile: boolean, mediaId: number) => {
  const d = SCHOOL_INFO_DEFAULTS;
  const f = new FormData();
  f.set("revision", "2");
  for (const key of [
    "schoolName",
    "shortName",
    "address",
    "phone",
    "email",
    "officeHours",
    "footerTagline",
  ] as const)
    f.set(key, d[key]);
  for (const program of d.footerPrograms) f.append("footerPrograms", program);
  imageFields(f, "logo", withFile, mediaId);
  return f;
};

describe.each([
  ["hero", saveHeroAction, heroForm, () => mocks.saveHero],
  ["about", saveAboutAction, aboutForm, () => mocks.saveAbout],
  ["admission", saveAdmissionAction, admissionForm, () => mocks.saveAdmission],
  [
    "school info",
    saveSchoolInfoAction,
    schoolInfoForm,
    () => mocks.saveSchoolInfo,
  ],
] as const)("%s save with a new image", (_name, action, build, saveMock) => {
  it("reports the stored media id for the uploaded image", async () => {
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
    // After applySavedImage the form sends mediaId 77 and no file.
    const result = await action(null, build(false, 77));
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(result).toMatchObject({ status: "success" });
    expect(result).toHaveProperty("uploadedMedia", undefined);
    expect(JSON.stringify(saveMock().mock.calls.at(-1)?.[0])).toContain(
      '"mediaId":77',
    );
  });
});
