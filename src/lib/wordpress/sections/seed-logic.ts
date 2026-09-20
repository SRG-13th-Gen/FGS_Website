/**
 * Decides whether the seed script should write default content into a
 * section's meta field. Pure so it's independently testable — the actual
 * network I/O lives in scripts/seed-content.ts.
 *
 * Never overwrites content already present, whether from a prior seed run or
 * an admin edit — only a missing/empty/placeholder value is seedable.
 */
export function shouldSeedSectionContent(
  existingMetaValue: string | undefined,
): boolean {
  if (!existingMetaValue) return true;
  const trimmed = existingMetaValue.trim();
  return trimmed === "" || trimmed === "{}";
}
