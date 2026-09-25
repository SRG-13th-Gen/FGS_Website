import type { z } from "zod";

import { ABOUT_DEFAULTS, aboutSchema } from "./about";
import { ADMISSION_DEFAULTS, admissionSchema } from "./admission";
import { CLUBS_DEFAULTS, clubsSchema } from "./clubs";
import { CONTACT_DEFAULTS, contactSchema } from "./contact";
import { GALLERY_DEFAULTS, gallerySchema } from "./gallery";
import { HERO_DEFAULTS, heroSchema } from "./hero";
import { SCHOOL_INFO_DEFAULTS, schoolInfoSchema } from "./school-info";
import type { SectionSlug } from "./types";

export interface SectionRegistryEntry {
  slug: SectionSlug;
  label: string;
  /** Title given to the seeded WordPress page. */
  pageTitle: string;
  /** Public homepage anchor for the "view this section" link. */
  publicAnchor: string;
  schema: z.ZodType;
  defaults: unknown;
}

/** Single source of truth for every section: slug, schema, and seed defaults. */
export const SECTION_REGISTRY: readonly SectionRegistryEntry[] = [
  {
    slug: "site-hero",
    label: "Hero",
    pageTitle: "Site Section: Hero",
    publicAnchor: "/#home",
    schema: heroSchema,
    defaults: HERO_DEFAULTS,
  },
  {
    slug: "site-about",
    label: "About",
    pageTitle: "Site Section: About",
    publicAnchor: "/#about",
    schema: aboutSchema,
    defaults: ABOUT_DEFAULTS,
  },
  {
    slug: "site-admission",
    label: "Admission",
    pageTitle: "Site Section: Admission",
    publicAnchor: "/#admission",
    schema: admissionSchema,
    defaults: ADMISSION_DEFAULTS,
  },
  {
    slug: "site-clubs",
    label: "Clubs",
    pageTitle: "Site Section: Clubs",
    publicAnchor: "/#clubs",
    schema: clubsSchema,
    defaults: CLUBS_DEFAULTS,
  },
  {
    slug: "site-gallery",
    label: "Gallery",
    pageTitle: "Site Section: Gallery",
    publicAnchor: "/#gallery",
    schema: gallerySchema,
    defaults: GALLERY_DEFAULTS,
  },
  {
    slug: "site-contact",
    label: "Contact",
    pageTitle: "Site Section: Contact",
    publicAnchor: "/#contact",
    schema: contactSchema,
    defaults: CONTACT_DEFAULTS,
  },
  {
    slug: "site-school-info",
    label: "School Info",
    pageTitle: "Site Section: School Info",
    publicAnchor: "/",
    schema: schoolInfoSchema,
    defaults: SCHOOL_INFO_DEFAULTS,
  },
] as const;

export function getSectionRegistryEntry(
  slug: SectionSlug,
): SectionRegistryEntry {
  const entry = SECTION_REGISTRY.find((s) => s.slug === slug);
  if (!entry) throw new Error(`Unknown section slug: ${slug}`);
  return entry;
}
