import { describe, it, expect } from 'vitest';
import { normalizeEmail, isValidEmail } from '@/lib/profile/normalizeEmail';

describe('normalizeEmail', () => {
  it.each([
    ['Jane@Gmail.com', 'jane@gmail.com'],
    ['JANE@GMAIL.COM', 'jane@gmail.com'],
    ['  jane@gmail.com  ', 'jane@gmail.com'],
    ['jane@gmail.com\n', 'jane@gmail.com'],
    ['\tjane@gmail.com\r\n', 'jane@gmail.com'],
    ['jane @gmail.com', 'jane@gmail.com'],           // internal whitespace
    ['jane@gmail.com\u00A0', 'jane@gmail.com'],      // non-breaking space
  ])('cleans %j -> %j', (input, expected) => {
    expect(normalizeEmail(input)).toBe(expected);
  });

  it('folds full-width characters via NFKC', () => {
    expect(normalizeEmail('ｊａｎｅ＠ｇｍａｉｌ．ｃｏｍ')).toBe('jane@gmail.com');
  });

  it('preserves plus-addressing, dots, and hyphens', () => {
    expect(normalizeEmail('Jane.Doe+Weddings@My-Mail.co.uk')).toBe(
      'jane.doe+weddings@my-mail.co.uk',
    );
  });

  it.each([null, undefined, '', '   ', '\n\t'])(
    'returns empty string for %j',
    (input) => {
      expect(normalizeEmail(input)).toBe('');
    },
  );

  it('is idempotent', () => {
    const once = normalizeEmail('  Jane@Gmail.com ');
    expect(normalizeEmail(once)).toBe(once);
  });
});

describe('isValidEmail', () => {
  it.each([
    'jane@gmail.com',
    'jane.doe+tag@sub.example.co.uk',
    'a@b.co',
  ])('accepts %j', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each([
    '',
    'jane',
    'jane@',
    '@gmail.com',
    'jane@gmail',            // no TLD
    'jane@@gmail.com',
    'jane@gmail.com extra',  // whitespace
    'foo bar@gmail.com',
  ])('rejects %j', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });

  it('works on the output of normalizeEmail', () => {
    expect(isValidEmail(normalizeEmail('  Jane@Gmail.com '))).toBe(true);
    expect(isValidEmail(normalizeEmail('   '))).toBe(false);
  });
});