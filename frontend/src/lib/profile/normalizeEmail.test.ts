import { describe, expect, it } from 'vitest';
import { isValidEmail, normalizeEmail } from '@/lib/profile/normalizeEmail';
import { leadFormSchema } from '@/types/leadsValidation';

describe('isValidEmail', () => {
  it('accepts a normal address', () => {
    expect(isValidEmail('jane@example.com')).toBe(true);
  });

  it.each([
    'jane@example..com',   // consecutive dots in the domain
    'ja..ne@example.com',  // consecutive dots in the local part
    '.jane@example.com',   // leading dot
    'jane@example',        // no TLD
  ])('rejects %s', (address) => {
    expect(isValidEmail(address)).toBe(false);
  });
});

describe('email validation parity with leadFormSchema', () => {
  const base = {
    vendor_id: 'vendor-1',
    firstName: 'Jane',
    lastName: 'Doe',
    additionalDetails: 'Hello',
    location: 'Los Angeles',
    budget: '1000',
    peopleCount: '2',
    services: ['bridal'],
  };

  it.each(['jane@example..com', 'ja..ne@example.com', 'jane@example.com'])(
    'agrees with isValidEmail for %s',
    (address) => {
      const result = leadFormSchema.safeParse({ ...base, email: address });
      expect(result.success).toBe(isValidEmail(normalizeEmail(address)));
    },
  );

  it('rejects jane@example..com on the form path', () => {
    const result = leadFormSchema.safeParse({ ...base, email: 'jane@example..com' });
    expect(result.success).toBe(false);
  });
});