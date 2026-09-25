import { z } from "zod";

import { SECTION_ICON_NAMES } from "./icons";

const iconSchema = z.enum(SECTION_ICON_NAMES);

const clubItemSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1).max(60),
  description: z.string().trim().min(1).max(300),
  meetingDay: z.string().trim().min(1).max(80),
  icon: iconSchema,
});

export const clubsSchema = z.object({
  sectionLabel: z.string().trim().min(1).max(60),
  heading: z.string().trim().min(3).max(150),
  intro: z.string().trim().max(400),
  clubs: z.array(clubItemSchema).min(1).max(16),
});
export type ClubsContent = z.infer<typeof clubsSchema>;
export type ClubItem = z.infer<typeof clubItemSchema>;

export const CLUBS_DEFAULTS: ClubsContent = {
  sectionLabel: "Clubs & Activities",
  heading: "Beyond the Classroom",
  intro: "Explore the student clubs described by Flor de Grace School.",
  clubs: [
    {
      name: "Science Club",
      category: "Science",
      description:
        "Explore scientific ideas through hands-on activities, experiments, and real-world discovery.",
      meetingDay: "Contact the school for the schedule",
      icon: "sparkles",
    },
    {
      name: "English Club",
      category: "Language & Communication",
      description:
        "Build confidence in speaking, writing, listening, and leadership through group activities.",
      meetingDay: "Contact the school for the schedule",
      icon: "book-open",
    },
    {
      name: "Makabayang Graciano",
      category: "Araling Panlipunan",
      description:
        "Discover Philippine history, culture, and heritage through the school's student society.",
      meetingDay: "Contact the school for the schedule",
      icon: "blocks",
    },
  ],
};
