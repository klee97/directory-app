/**
 * Produces a privacy-preserving hint of an email address for display, e.g.
 * "jane@gmail.com" -> "ja•••@•••.com". Enough for the owner to recognize their
 * inbox without revealing the full address to onlookers.
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "•••";

  const maskedLocal = `${local.slice(0, 2)}•••`;

  return `${maskedLocal}@${domain}`;
}
