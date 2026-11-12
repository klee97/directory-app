import { z } from 'zod';

export const EMAIL_ERROR_MESSAGE = 'Enter a valid email address';

// Single source of truth for email validity. Used by leadFormSchema and isValidEmail
// so every submission path treats edge cases (e.g. consecutive dots) the same way.
export const emailSchema = z.email(EMAIL_ERROR_MESSAGE);

export function normalizeEmail(value: string | null | undefined): string {
  // NFKC folds look-alike/full-width characters; emails can't contain whitespace,
  // so stripping all of it is safe (handles pasted trailing spaces/newlines).
  return (value ?? '').normalize('NFKC').replace(/\s+/g, '').toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return emailSchema.safeParse(value).success;
}