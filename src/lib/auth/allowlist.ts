/** Exact email addresses, normalized only for case and surrounding whitespace. */
export function isApprovedAdminEmail(
  email: string | null | undefined,
  configured: string | undefined = process.env.ADMIN_ALLOWED_EMAILS,
): boolean {
  if (!email || !configured) return false;
  const candidate = email.trim().toLowerCase();
  if (!/^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(candidate)) return false;
  return configured
    .split(",")
    .some((entry) => entry.trim().toLowerCase() === candidate);
}
