export const PHONE_MAX_LENGTH = 32;
export const PHONE_MIN_DIGITS = 7;
export const PHONE_MAX_DIGITS = 15;

// Optional leading +, then digits, spaces, parentheses, dots, hyphens
const PHONE_ALLOWED_CHARS = /^\+?[\d\s().-]+$/;

export const PHONE_ERROR_MESSAGE = `Enter a valid phone number`;

/** Expects an already-trimmed, non-empty string. */
export function isValidPhone(value: string): boolean {
  if (value.length > PHONE_MAX_LENGTH) return false;
  if (!PHONE_ALLOWED_CHARS.test(value)) return false;
  const digits = value.replace(/\D/g, '').length;
  return digits >= PHONE_MIN_DIGITS && digits <= PHONE_MAX_DIGITS;
}