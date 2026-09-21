import {
  Blocks,
  BookOpen,
  Dumbbell,
  Mail,
  MapPin,
  Monitor,
  Music,
  Palette,
  Phone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/** Curated icon set for section content — admins pick from this list, never free-form. */
export const SECTION_ICON_OPTIONS = {
  "map-pin": MapPin,
  phone: Phone,
  mail: Mail,
  blocks: Blocks,
  "book-open": BookOpen,
  palette: Palette,
  music: Music,
  dumbbell: Dumbbell,
  monitor: Monitor,
  sparkles: Sparkles,
} as const satisfies Record<string, LucideIcon>;

export type SectionIconName = keyof typeof SECTION_ICON_OPTIONS;

// A non-empty literal-typed tuple (not just SectionIconName[]) so z.enum()
// infers the actual icon-name union instead of widening it to `string`.
export const SECTION_ICON_NAMES = Object.keys(SECTION_ICON_OPTIONS) as [
  SectionIconName,
  ...SectionIconName[],
];
