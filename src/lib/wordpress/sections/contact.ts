import { z } from "zod";

import { SECTION_ICON_NAMES } from "./icons";

const iconSchema = z.enum(SECTION_ICON_NAMES);

const contactCardSchema = z.object({
  icon: iconSchema,
  title: z.string().trim().min(1).max(60),
  detail: z.string().trim().min(1).max(150),
  sub: z.string().trim().max(150),
});

export const contactSchema = z.object({
  sectionLabel: z.string().trim().min(1).max(60),
  heading: z.string().trim().min(3).max(150),
  intro: z.string().trim().max(400),
  cards: z.array(contactCardSchema).min(1).max(6),
});
export type ContactContent = z.infer<typeof contactSchema>;
export type ContactCard = z.infer<typeof contactCardSchema>;

export const CONTACT_DEFAULTS: ContactContent = {
  sectionLabel: "Contact Us",
  heading: "Get in Touch",
  intro:
    "Have questions? We'd love to hear from you. Reach out to us through any of the channels below.",
  cards: [
    {
      icon: "map-pin",
      title: "Visit Us",
      detail: "Flor de Grace School Inc.",
      sub: "74 Gold St, Quezon City, 1121 Metro Manila",
    },
    {
      icon: "phone",
      title: "Call Us",
      detail: "09682200677",
      sub: "Contact the school for office hours",
    },
    {
      icon: "mail",
      title: "Email Us",
      detail: "flordegrace.school2001@gmail.com",
      sub: "Contact the school office",
    },
  ],
};
