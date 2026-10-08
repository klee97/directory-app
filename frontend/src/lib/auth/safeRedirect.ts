export function safeRedirectPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/[\u0000-\u001f\u007f]/.test(value)) return null;       // control chars
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  try {
    // Final guard: must still resolve to our own origin
    const base = "http://internal.invalid";
    if (new URL(value, base).origin !== base) return null;
  } catch {
    return null;
  }
  return value;
}