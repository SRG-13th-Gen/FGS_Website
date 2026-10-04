/** Schema choices are independent of the React icon implementation. */
export const SECTION_ICON_NAMES = [
  "map-pin",
  "phone",
  "mail",
  "blocks",
  "book-open",
  "palette",
  "music",
  "dumbbell",
  "monitor",
  "sparkles",
] as const;
export type SectionIconName = (typeof SECTION_ICON_NAMES)[number];
