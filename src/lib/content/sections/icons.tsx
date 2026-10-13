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

export const SECTION_ICON_LABELS = {
  "map-pin": "Location / Address",
  phone: "Phone / Telephone",
  mail: "Email / Inquiries",
  blocks: "Blocks / Early Childhood",
  "book-open": "Book / Academics",
  palette: "Art / Creative Arts",
  music: "Music / Performing Arts",
  dumbbell: "Sports / Athletics",
  monitor: "Computer / Technology",
  sparkles: "Highlights / Special",
} as const satisfies Record<string, string>;

export { SECTION_ICON_NAMES, type SectionIconName } from "./icon-names";
