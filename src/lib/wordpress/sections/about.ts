import { z } from "zod";

export const aboutSchema = z.object({
  sectionLabel: z.string().trim().min(1).max(60),
  heading: z.string().trim().min(3).max(150),
  /** Rendered in reading order, auto-balanced into two columns. */
  storyParagraphs: z.array(z.string().trim().min(1).max(2000)).min(1).max(12),
  mission: z.string().trim().min(1).max(600),
  vision: z.string().trim().min(1).max(600),
});
export type AboutContent = z.infer<typeof aboutSchema>;

export const ABOUT_DEFAULTS: AboutContent = {
  sectionLabel: "About Us",
  heading: "Building Futures, One Student at a Time",
  storyParagraphs: [
    "For over two decades, since its establishment in 2001, Flor de Grace School Inc. has stood as a nurturing ground, diligently cultivating the seeds of potential within each student. Rooted in a profound mission to provide a quality education through a holistic approach that fosters academic excellence, character development, and lifelong learning, the school has become an integral part of our community, shaping not just minds, but also hearts and souls.",
    "Flor de Grace School’s vision is ambitious and inspiring: to become a model institution of learning that shapes well-rounded individuals—academically excellent, morally upright, and committed to lifelong growth and service to others. This is not merely a statement etched on a wall; it is a living ethos that permeates every classroom, every interaction, and every activity within the school’s vibrant walls.",
    "The commitment to a holistic approach is particularly noteworthy. Education at Flor de Grace School extends far beyond the acquisition of facts and figures. It recognizes the intricate tapestry of a child's development, weaving together intellectual rigor with the cultivation of strong moral principles and a genuine thirst for knowledge.",
    "Academic excellence is undoubtedly a cornerstone. Flor de Grace School strives to equip its students with the critical thinking skills, problem-solving abilities, and subject matter mastery necessary to thrive in an increasingly complex world. However, these pursuits of knowledge are never at the expense of character development.",
    "The school understands that true success lies not just in what one knows, but in who one becomes. Through its programs and guidance, Flor de Grace School instills values such as integrity, respect, responsibility, and empathy, nurturing individuals who will contribute positively to society.",
    "Furthermore, the emphasis on lifelong learning is crucial in today’s rapidly evolving landscape. Flor de Grace School empowers its students to become active and engaged learners, fostering curiosity, adaptability, and a passion for continuous growth. This ensures that graduates are equipped with the mindset and skills to navigate the challenges and opportunities of their future endeavors.",
  ],
  mission:
    "We are committed to providing quality education through a holistic approach that fosters academic excellence, character development, and lifelong learning.",
  vision:
    "Our vision is to become a model institution of learning that shapes well-rounded individuals—academically excellent, morally upright, and committed to lifelong growth and service to others.",
};
