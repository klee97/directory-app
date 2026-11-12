export function normalizeEmail(value: string | null | undefined): string {
  // NFKC folds look-alike/full-width characters; emails can't contain whitespace,
  // so stripping all of it is safe (handles pasted trailing spaces/newlines).
  return (value ?? '').normalize('NFKC').replace(/\s+/g, '').toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}