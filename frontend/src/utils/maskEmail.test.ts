import { describe, expect, it } from 'vitest';

import { maskEmail } from './maskEmail';

describe('maskEmail', () => {
  it('keeps the first two local characters and the TLD', () => {
    expect(maskEmail('jane@gmail.com')).toBe('ja•••@•••.com');
  });

  it('masks everything but the final TLD for multi-part domains', () => {
    expect(maskEmail('bookings@studio.co.uk')).toBe('bo•••@•••.uk');
  });

  it('never leaks more than two characters of a short local part', () => {
    expect(maskEmail('a@gmail.com')).toBe('a•••@•••.com');
  });

  it('falls back to a domain-less hint when the domain has no dot', () => {
    expect(maskEmail('jane@localhost')).toBe('ja•••@•••');
  });

  it('returns a fully masked hint for values that are not email addresses', () => {
    expect(maskEmail('not-an-email')).toBe('•••');
    expect(maskEmail('')).toBe('•••');
    expect(maskEmail('@gmail.com')).toBe('•••');
    expect(maskEmail('jane@')).toBe('•••');
  });
});
