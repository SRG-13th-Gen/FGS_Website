import { z } from "zod";

import { SECTION_ICON_NAMES } from "./icons";

const iconSchema = z.enum(SECTION_ICON_NAMES as [string, ...string[]]);

const programSchema = z.object({
  name: z.string().trim().min(1).max(60),
  levelLabel: z.string().trim().min(1).max(60),
  description: z.string().trim().min(1).max(300),
  icon: iconSchema,
});

const requirementCategorySchema = z.object({
  badgeLabel: z.string().trim().min(1).max(40),
  title: z.string().trim().min(1).max(60),
  items: z.array(z.string().trim().min(1).max(150)).min(1).max(12),
});

const enrollmentStepSchema = z.object({
  title: z.string().trim().min(1).max(60),
  description: z.string().trim().min(1).max(300),
});

export const admissionSchema = z.object({
  sectionLabel: z.string().trim().min(1).max(60),
  heading: z.string().trim().min(3).max(150),
  intro: z.string().trim().max(500),
  programs: z.array(programSchema).min(1).max(6),
  requirementCategories: z.array(requirementCategorySchema).min(1).max(6),
  /** Numbered 01, 02, 03... by position — no separate order field needed. */
  enrollmentSteps: z.array(enrollmentStepSchema).min(1).max(8),
});
export type AdmissionContent = z.infer<typeof admissionSchema>;
export type AdmissionProgram = z.infer<typeof programSchema>;
export type AdmissionRequirementCategory = z.infer<
  typeof requirementCategorySchema
>;
export type AdmissionEnrollmentStep = z.infer<typeof enrollmentStepSchema>;

export const ADMISSION_DEFAULTS: AdmissionContent = {
  sectionLabel: "Admission",
  heading: "Start Your Journey with Us",
  intro:
    "We welcome young learners who are eager to explore, discover, and grow. Here's everything you need to join the FGS family.",
  programs: [
    {
      name: "Preschool",
      levelLabel: "Kinder 1–2 / Preparatory",
      description:
        "A play-based, nurturing environment designed to build foundational social, emotional, and cognitive skills.",
      icon: "blocks",
    },
    {
      name: "Elementary",
      levelLabel: "Grades 1–6",
      description:
        "A strong academic curriculum emphasizing critical thinking, values formation, and a genuine love for learning.",
      icon: "book-open",
    },
  ],
  requirementCategories: [
    {
      badgeLabel: "Returning",
      title: "Old Students",
      items: ["Form 137 (Kinder / Preschool)"],
    },
    {
      badgeLabel: "New Enrollment",
      title: "New Students",
      items: [
        "Birth Certificate",
        "Form 137 (Kinder / Preschool)",
        "ECCD (for Preparatory Class)",
      ],
    },
    {
      badgeLabel: "All Levels",
      title: "Transferees",
      items: [
        "Birth Certificate",
        "Form 137 (Kinder / Preschool)",
        "Good Moral Certificate",
        "ECCD (for Preparatory Class)",
      ],
    },
  ],
  enrollmentSteps: [
    {
      title: "Inquire",
      description:
        "Visit the school or reach out through our contact form to learn about available slots and requirements.",
    },
    {
      title: "Submit Requirements",
      description:
        "Prepare and submit the required documents for your student category (Old, New, or Transferee).",
    },
    {
      title: "Enroll",
      description:
        "Complete the enrollment form, settle fees, and officially welcome your child to the FGS family!",
    },
  ],
};
