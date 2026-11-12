import { z } from 'zod';

export const EMAIL_ERROR_MESSAGE = 'Enter a valid email address';

// Single source of truth for email validity. Used by leadFormSchema and isValidEmail
// so every submission path treats edge cases (e.g. consecutive dots) the same way.
export const emailSchema = z.email(EMAIL_ERROR_MESSAGE);

/** Trims edge whitespace and lowercases. */
export function normalizeEmail(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

/** Well-formed, ASCII, no internal whitespace. Anything else is rejected, not repaired. */
export function isValidEmail(value: string): boolean {
  return emailSchema.safeParse(value).success;
}