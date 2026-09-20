import { describe, expect, it } from "vitest";

import { ABOUT_DEFAULTS, aboutSchema } from "@/lib/wordpress/sections/about";
import {
  ADMISSION_DEFAULTS,
  admissionSchema,
} from "@/lib/wordpress/sections/admission";
import { CLUBS_DEFAULTS, clubsSchema } from "@/lib/wordpress/sections/clubs";
import {
  CONTACT_DEFAULTS,
  contactSchema,
} from "@/lib/wordpress/sections/contact";
import {
  GALLERY_DEFAULTS,
  gallerySchema,
} from "@/lib/wordpress/sections/gallery";
import { HERO_DEFAULTS, heroSchema } from "@/lib/wordpress/sections/hero";
import {
  SCHOOL_INFO_DEFAULTS,
  schoolInfoSchema,
} from "@/lib/wordpress/sections/school-info";
import { imageRefSchema } from "@/lib/wordpress/sections/types";

describe("every section's default content satisfies its own schema", () => {
  // Text-only sections: the default is exactly what the schema expects.
  it.each([
    ["about", aboutSchema, ABOUT_DEFAULTS],
    ["admission", admissionSchema, ADMISSION_DEFAULTS],
    ["contact", contactSchema, CONTACT_DEFAULTS],
    ["clubs", clubsSchema, CLUBS_DEFAULTS],
    ["gallery", gallerySchema, GALLERY_DEFAULTS],
  ] as const)("%s", (_label, schema, defaults) => {
    expect(schema.safeParse(defaults).success).toBe(true);
  });

  // Hero/School Info use mediaId: 0 as a seed-time placeholder the seed
  // script replaces with a real uploaded media id before writing/validating
  // — see scripts/seed-content.ts resolveDefaultsWithImages().
  it("hero (with a resolved media id, as the seed script writes it)", () => {
    const seeded = {
      ...HERO_DEFAULTS,
      backgroundImage: { ...HERO_DEFAULTS.backgroundImage, mediaId: 1 },
    };
    expect(heroSchema.safeParse(seeded).success).toBe(true);
  });

  it("school-info (with a resolved media id, as the seed script writes it)", () => {
    const seeded = {
      ...SCHOOL_INFO_DEFAULTS,
      logo: { ...SCHOOL_INFO_DEFAULTS.logo, mediaId: 1 },
    };
    expect(schoolInfoSchema.safeParse(seeded).success).toBe(true);
  });
});

describe("imageRefSchema", () => {
  it("accepts a positive media id and alt text", () => {
    expect(
      imageRefSchema.safeParse({ mediaId: 5, alt: "A photo" }).success,
    ).toBe(true);
  });
  it("rejects a zero or negative media id", () => {
    expect(imageRefSchema.safeParse({ mediaId: 0, alt: "" }).success).toBe(
      false,
    );
    expect(imageRefSchema.safeParse({ mediaId: -1, alt: "" }).success).toBe(
      false,
    );
  });
});

describe("heroSchema", () => {
  it("rejects a too-short heading", () => {
    const result = heroSchema.safeParse({ ...HERO_DEFAULTS, heading: "Hi" });
    expect(result.success).toBe(false);
  });
  it("rejects a heading over 200 characters", () => {
    const result = heroSchema.safeParse({
      ...HERO_DEFAULTS,
      heading: "x".repeat(201),
    });
    expect(result.success).toBe(false);
  });
  it("rejects a missing background image", () => {
    const { heading, tagline } = HERO_DEFAULTS;
    expect(heroSchema.safeParse({ heading, tagline }).success).toBe(false);
  });
});

describe("schoolInfoSchema", () => {
  it("rejects an invalid email", () => {
    const result = schoolInfoSchema.safeParse({
      ...SCHOOL_INFO_DEFAULTS,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
  it("rejects an empty school name", () => {
    const result = schoolInfoSchema.safeParse({
      ...SCHOOL_INFO_DEFAULTS,
      schoolName: "",
    });
    expect(result.success).toBe(false);
  });
  it("caps footerPrograms at 10 items", () => {
    const result = schoolInfoSchema.safeParse({
      ...SCHOOL_INFO_DEFAULTS,
      footerPrograms: Array.from({ length: 11 }, (_, i) => `Program ${i}`),
    });
    expect(result.success).toBe(false);
  });
});

describe("aboutSchema", () => {
  it("requires at least one story paragraph", () => {
    const result = aboutSchema.safeParse({
      ...ABOUT_DEFAULTS,
      storyParagraphs: [],
    });
    expect(result.success).toBe(false);
  });
  it("caps story paragraphs at 12", () => {
    const result = aboutSchema.safeParse({
      ...ABOUT_DEFAULTS,
      storyParagraphs: Array.from({ length: 13 }, (_, i) => `Paragraph ${i}`),
    });
    expect(result.success).toBe(false);
  });
});

describe("admissionSchema", () => {
  it("rejects an unknown icon name", () => {
    const result = admissionSchema.safeParse({
      ...ADMISSION_DEFAULTS,
      programs: [
        { ...ADMISSION_DEFAULTS.programs[0], icon: "not-a-real-icon" },
      ],
    });
    expect(result.success).toBe(false);
  });
  it("requires at least one requirement category", () => {
    const result = admissionSchema.safeParse({
      ...ADMISSION_DEFAULTS,
      requirementCategories: [],
    });
    expect(result.success).toBe(false);
  });
  it("requires at least one item within a requirement category", () => {
    const result = admissionSchema.safeParse({
      ...ADMISSION_DEFAULTS,
      requirementCategories: [{ badgeLabel: "x", title: "y", items: [] }],
    });
    expect(result.success).toBe(false);
  });
  it("caps enrollment steps at 8", () => {
    const result = admissionSchema.safeParse({
      ...ADMISSION_DEFAULTS,
      enrollmentSteps: Array.from({ length: 9 }, (_, i) => ({
        title: `Step ${i}`,
        description: "x",
      })),
    });
    expect(result.success).toBe(false);
  });
});

describe("contactSchema", () => {
  it("requires at least one card", () => {
    const result = contactSchema.safeParse({ ...CONTACT_DEFAULTS, cards: [] });
    expect(result.success).toBe(false);
  });
  it("caps cards at 6", () => {
    const result = contactSchema.safeParse({
      ...CONTACT_DEFAULTS,
      cards: Array.from({ length: 7 }, () => CONTACT_DEFAULTS.cards[0]),
    });
    expect(result.success).toBe(false);
  });
});

describe("clubsSchema", () => {
  it("requires at least one club", () => {
    const result = clubsSchema.safeParse({ ...CLUBS_DEFAULTS, clubs: [] });
    expect(result.success).toBe(false);
  });
  it("caps clubs at 16", () => {
    const result = clubsSchema.safeParse({
      ...CLUBS_DEFAULTS,
      clubs: Array.from({ length: 17 }, () => CLUBS_DEFAULTS.clubs[0]),
    });
    expect(result.success).toBe(false);
  });
});

describe("gallerySchema", () => {
  it("allows an empty photo list", () => {
    expect(
      gallerySchema.safeParse({ ...GALLERY_DEFAULTS, photos: [] }).success,
    ).toBe(true);
  });
  it("caps photos at 30", () => {
    const result = gallerySchema.safeParse({
      ...GALLERY_DEFAULTS,
      photos: Array.from({ length: 31 }, () => ({
        image: { mediaId: 1, alt: "x" },
        caption: "",
      })),
    });
    expect(result.success).toBe(false);
  });
  it("defaults a missing caption to an empty string", () => {
    const result = gallerySchema.safeParse({
      ...GALLERY_DEFAULTS,
      photos: [{ image: { mediaId: 1, alt: "x" } }],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.photos[0].caption).toBe("");
  });
});
