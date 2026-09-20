import { z } from "zod";

import { imageRefSchema, type ResolvedImage } from "./types";

export const schoolInfoSchema = z.object({
  schoolName: z.string().trim().min(3).max(150),
  /** Short label for the mobile navbar (e.g. "FGS"). */
  shortName: z.string().trim().min(1).max(20),
  logo: imageRefSchema,
  address: z.string().trim().min(3).max(300),
  phone: z.string().trim().min(3).max(50),
  email: z.email().max(150),
  officeHours: z.string().trim().min(1).max(150),
  footerTagline: z.string().trim().max(300),
  footerPrograms: z.array(z.string().trim().min(1).max(80)).max(10),
});
export type SchoolInfoContent = z.infer<typeof schoolInfoSchema>;

export interface SchoolInfoView extends Omit<SchoolInfoContent, "logo"> {
  logo: ResolvedImage;
}

export const SCHOOL_INFO_DEFAULTS: SchoolInfoContent = {
  schoolName: "Flor de Grace School Inc.",
  shortName: "FGS",
  logo: { mediaId: 0, alt: "Flor de Grace School logo" },
  address: "74 Gold St, Quezon City, 1121 Metro Manila",
  phone: "09682200677",
  email: "flordegrace.school2001@gmail.com",
  officeHours: "Mon–Fri, 7:00 AM – 5:00 PM",
  footerTagline:
    "Nurturing minds, building futures. A school committed to excellence in education.",
  footerPrograms: ["Preschool", "Elementary"],
};

export const SCHOOL_INFO_FALLBACK: SchoolInfoView = {
  ...SCHOOL_INFO_DEFAULTS,
  logo: {
    mediaId: 0,
    url: "/images/logo/fgs-logo-website-1.webp",
    alt: SCHOOL_INFO_DEFAULTS.logo.alt,
  },
};
