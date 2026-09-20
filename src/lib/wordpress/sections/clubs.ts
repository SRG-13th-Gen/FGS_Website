import { z } from "zod";

import { SECTION_ICON_NAMES } from "./icons";

const iconSchema = z.enum(SECTION_ICON_NAMES as [string, ...string[]]);

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
  intro:
    "Discover passions, build friendships, and cultivate lifelong talents through our extracurricular programs.",
  clubs: [
    {
      name: "Arts & Crafts Club",
      category: "Creative Arts",
      description:
        "Express creativity through painting, sketching, paper craft, and collaborative mural projects.",
      meetingDay: "Wednesdays, 3:30 PM",
      icon: "palette",
    },
    {
      name: "Music & Choir Club",
      category: "Performing Arts",
      description:
        "Develop vocal harmony, choral singing, and musical instrument fundamentals for school programs.",
      meetingDay: "Tuesdays, 3:30 PM",
      icon: "music",
    },
    {
      name: "Sports & Athletics",
      category: "Physical Fitness",
      description:
        "Build agility, team spirit, and sportsmanship through basketball, volleyball, and active play.",
      meetingDay: "Fridays, 3:30 PM",
      icon: "dumbbell",
    },
    {
      name: "Tech & Robotics Club",
      category: "STEM",
      description:
        "Learn beginner-friendly coding, robotics kits, and digital problem-solving in a fun workshop environment.",
      meetingDay: "Thursdays, 3:30 PM",
      icon: "monitor",
    },
    {
      name: "Young Readers Club",
      category: "Literary & Debate",
      description:
        "Explore classic literature, storytelling, and develop confident public speaking and debate skills.",
      meetingDay: "Mondays, 3:30 PM",
      icon: "book-open",
    },
    {
      name: "Science Explorers",
      category: "Discovery",
      description:
        "Engage in hands-on science experiments, nature observation, and annual science fair projects.",
      meetingDay: "Wednesdays, 3:30 PM",
      icon: "sparkles",
    },
  ],
};
