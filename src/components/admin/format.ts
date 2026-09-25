export function formatLastUpdated(iso: string | null): string {
  if (!iso) return "Not seeded yet";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Not seeded yet";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
