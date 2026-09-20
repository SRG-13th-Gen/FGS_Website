import "server-only";

import { aboutSchema, ABOUT_DEFAULTS } from "./about";
import {
  fetchSectionPage,
  resolveImageRef,
  createSectionAdapter,
  saveSectionRaw,
  zodIssuesToFieldErrors,
} from "./adapter";
import { admissionSchema, ADMISSION_DEFAULTS } from "./admission";
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

export const aboutContent = createSectionAdapter(
  "site-about",
  aboutSchema,
  ABOUT_DEFAULTS,
);
export const admissionContent = createSectionAdapter(
  "site-admission",
  admissionSchema,
  ADMISSION_DEFAULTS,
);
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
  async save(data: HeroContent): Promise<SectionSaveResult> {
    const parsed = heroSchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "validation_error",
        fieldErrors: zodIssuesToFieldErrors(parsed.error),
      };
    }
    return saveSectionRaw("site-hero", parsed.data);
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
  async save(data: SchoolInfoContent): Promise<SectionSaveResult> {
    const parsed = schoolInfoSchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "validation_error",
        fieldErrors: zodIssuesToFieldErrors(parsed.error),
      };
    }
    return saveSectionRaw("site-school-info", parsed.data);
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
  async save(data: GalleryContent): Promise<SectionSaveResult> {
    const parsed = gallerySchema.safeParse(data);
    if (!parsed.success) {
      return {
        status: "validation_error",
        fieldErrors: zodIssuesToFieldErrors(parsed.error),
      };
    }
    return saveSectionRaw("site-gallery", parsed.data);
  },
};
