import "server-only";

import {
  ABOUT_DEFAULTS,
  ABOUT_FALLBACK,
  aboutSchema,
  type AboutContent,
  type AboutView,
} from "./about";
import { rows } from "../db";
import {
  fetchSectionPage,
  resolveImageRef,
  createSectionAdapter,
  saveSectionRaw,
  zodIssuesToFieldErrors,
} from "./adapter";
import {
  ADMISSION_DEFAULTS,
  ADMISSION_FALLBACK,
  admissionSchema,
  type AdmissionContent,
  type AdmissionView,
} from "./admission";
import {
  alumniSchema,
  ALUMNI_DEFAULTS,
  ALUMNI_FALLBACK,
  type AlumniContent,
  type AlumniResult,
  type AlumniView,
} from "./alumni";
import { clubsSchema, CLUBS_DEFAULTS } from "./clubs";
import { contactSchema, CONTACT_DEFAULTS } from "./contact";
import {
  gallerySchema,
  GALLERY_DEFAULTS,
  GALLERY_FALLBACK,
  type GalleryContent,
  type GalleryView,
} from "./gallery";
import {
  heroSchema,
  HERO_DEFAULTS,
  HERO_FALLBACK,
  type HeroContent,
  type HeroView,
} from "./hero";
import {
  schoolInfoSchema,
  SCHOOL_INFO_DEFAULTS,
  SCHOOL_INFO_FALLBACK,
  type SchoolInfoContent,
  type SchoolInfoView,
} from "./school-info";
import type { SectionSaveResult } from "./types";

export const contactContent = createSectionAdapter(
  "site-contact",
  contactSchema,
  CONTACT_DEFAULTS,
);
export const clubsContent = createSectionAdapter(
  "site-clubs",
  clubsSchema,
  CLUBS_DEFAULTS,
);

export const heroContent = {
  slug: "site-hero" as const,
  schema: heroSchema,
  defaults: HERO_DEFAULTS,
  async get(): Promise<HeroView> {
    const page = await fetchSectionPage("site-hero");
    if (!page) return HERO_FALLBACK;
    const parsed = heroSchema.safeParse(page.data);
    if (!parsed.success) return HERO_FALLBACK;
    const backgroundImage = await resolveImageRef(
      parsed.data.backgroundImage,
      HERO_FALLBACK.backgroundImage,
    );
    return {
      heading: parsed.data.heading,
      tagline: parsed.data.tagline,
      backgroundImage,
    };
  },
  async getLastModified(): Promise<string | null> {
    return (await fetchSectionPage("site-hero"))?.modifiedAt ?? null;
  },
  async save(
    data: HeroContent,
    expectedRevision: number,
  ): Promise<SectionSaveResult> {
    const parsed = heroSchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "validation_error",
        fieldErrors: zodIssuesToFieldErrors(parsed.error),
      };
    }
    return saveSectionRaw("site-hero", parsed.data, expectedRevision);
  },
};

export const schoolInfoContent = {
  slug: "site-school-info" as const,
  schema: schoolInfoSchema,
  defaults: SCHOOL_INFO_DEFAULTS,
  async get(): Promise<SchoolInfoView> {
    const page = await fetchSectionPage("site-school-info");
    if (!page) return SCHOOL_INFO_FALLBACK;
    const parsed = schoolInfoSchema.safeParse(page.data);
    if (!parsed.success) return SCHOOL_INFO_FALLBACK;
    const logo = await resolveImageRef(
      parsed.data.logo,
      SCHOOL_INFO_FALLBACK.logo,
    );
    return { ...parsed.data, logo };
  },
  async getLastModified(): Promise<string | null> {
    return (await fetchSectionPage("site-school-info"))?.modifiedAt ?? null;
  },
  async save(
    data: SchoolInfoContent,
    expectedRevision: number,
  ): Promise<SectionSaveResult> {
    const parsed = schoolInfoSchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "validation_error",
        fieldErrors: zodIssuesToFieldErrors(parsed.error),
      };
    }
    return saveSectionRaw("site-school-info", parsed.data, expectedRevision);
  },
};

export const aboutContent = {
  slug: "site-about" as const,
  schema: aboutSchema,
  defaults: ABOUT_DEFAULTS,
  async get(): Promise<AboutView> {
    const page = await fetchSectionPage("site-about");
    if (!page) return ABOUT_FALLBACK;
    const parsed = aboutSchema.safeParse(page.data);
    if (!parsed.success) return ABOUT_FALLBACK;
    const bannerImage = await resolveImageRef(
      parsed.data.featureBanner.image,
      ABOUT_FALLBACK.featureBanner.image,
    );
    return {
      ...parsed.data,
      featureBanner: { ...parsed.data.featureBanner, image: bannerImage },
    };
  },
  async getLastModified(): Promise<string | null> {
    return (await fetchSectionPage("site-about"))?.modifiedAt ?? null;
  },
  async save(
    data: AboutContent,
    expectedRevision: number,
  ): Promise<SectionSaveResult> {
    const parsed = aboutSchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "validation_error",
        fieldErrors: zodIssuesToFieldErrors(parsed.error),
      };
    }
    return saveSectionRaw("site-about", parsed.data, expectedRevision);
  },
};

export const admissionContent = {
  slug: "site-admission" as const,
  schema: admissionSchema,
  defaults: ADMISSION_DEFAULTS,
  async get(): Promise<AdmissionView> {
    const page = await fetchSectionPage("site-admission");
    if (!page) return ADMISSION_FALLBACK;
    const parsed = admissionSchema.safeParse(page.data);
    if (!parsed.success) return ADMISSION_FALLBACK;
    const backgroundImage = await resolveImageRef(
      parsed.data.backgroundImage,
      ADMISSION_FALLBACK.backgroundImage,
    );
    return { ...parsed.data, backgroundImage };
  },
  async getLastModified(): Promise<string | null> {
    return (await fetchSectionPage("site-admission"))?.modifiedAt ?? null;
  },
  async save(
    data: AdmissionContent,
    expectedRevision: number,
  ): Promise<SectionSaveResult> {
    const parsed = admissionSchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "validation_error",
        fieldErrors: zodIssuesToFieldErrors(parsed.error),
      };
    }
    return saveSectionRaw("site-admission", parsed.data, expectedRevision);
  },
};

export const galleryContent = {
  slug: "site-gallery" as const,
  schema: gallerySchema,
  defaults: GALLERY_DEFAULTS,
  async get(): Promise<GalleryView> {
    const page = await fetchSectionPage("site-gallery");
    if (!page) return GALLERY_FALLBACK;
    const parsed = gallerySchema.safeParse(page.data);
    if (!parsed.success) return GALLERY_FALLBACK;
    const photos = await Promise.all(
      parsed.data.photos.map(async (photo) => ({
        image: await resolveImageRef(photo.image, {
          mediaId: 0,
          url: "",
          alt: photo.caption,
        }),
        caption: photo.caption,
      })),
    );
    return {
      sectionLabel: parsed.data.sectionLabel,
      heading: parsed.data.heading,
      intro: parsed.data.intro,
      photos: photos.filter((p) => p.image.url),
    };
  },
  async getLastModified(): Promise<string | null> {
    return (await fetchSectionPage("site-gallery"))?.modifiedAt ?? null;
  },
  async save(
    data: GalleryContent,
    expectedRevision: number,
  ): Promise<SectionSaveResult> {
    const parsed = gallerySchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "validation_error",
        fieldErrors: zodIssuesToFieldErrors(parsed.error),
      };
    }
    return saveSectionRaw("site-gallery", parsed.data, expectedRevision);
  },
};

async function resolveAlumni(data: AlumniContent): Promise<AlumniView> {
  const achievements = await Promise.all(
    data.achievements.map(async ({ image, ...rest }) => {
      // A missing media record renders the card without a photo.
      const resolved = image
        ? await resolveImageRef(image, { mediaId: 0, url: "", alt: "" })
        : null;
      return { ...rest, image: resolved?.url ? resolved : null };
    }),
  );
  return { ...data, achievements };
}

export const alumniContent = {
  slug: "site-alumni" as const,
  schema: alumniSchema,
  defaults: ALUMNI_DEFAULTS,
  async get(): Promise<AlumniView> {
    const page = await fetchSectionPage("site-alumni");
    if (!page) return ALUMNI_FALLBACK;
    const parsed = alumniSchema.safeParse(page.data);
    return parsed.success ? resolveAlumni(parsed.data) : ALUMNI_FALLBACK;
  },
  /**
   * Public read that tells a database outage apart from missing content, so
   * the Alumni page never presents an outage as an empty list. A missing or
   * invalid stored row falls back to the defaults.
   */
  async getResult(): Promise<AlumniResult> {
    try {
      const [row] = await rows("SELECT data FROM sections WHERE slug = ?", [
        "site-alumni",
      ]);
      const data =
        typeof row?.data === "string" ? JSON.parse(row.data) : row?.data;
      const parsed = alumniSchema.safeParse(data);
      return {
        status: "ok",
        alumni: parsed.success
          ? await resolveAlumni(parsed.data)
          : ALUMNI_FALLBACK,
      };
    } catch {
      return { status: "unavailable" };
    }
  },
  async getLastModified(): Promise<string | null> {
    return (await fetchSectionPage("site-alumni"))?.modifiedAt ?? null;
  },
  async save(
    data: AlumniContent,
    expectedRevision: number,
  ): Promise<SectionSaveResult> {
    const parsed = alumniSchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "validation_error",
        fieldErrors: zodIssuesToFieldErrors(parsed.error),
      };
    }
    return saveSectionRaw("site-alumni", parsed.data, expectedRevision);
  },
};
