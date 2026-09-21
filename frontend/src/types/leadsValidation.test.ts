import { describe, it, expect } from 'vitest';
import { leadFormSchema } from '@/types/leadsValidation';

const validBase = {
  vendor_id: 'vendor-1',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  additionalDetails: 'Looking for a natural look.',
  location: 'Los Angeles, CA',
  budget: '500',
  peopleCount: '4',
  services: ['Hair'],
};

describe('leadFormSchema', () => {
  it('accepts a minimal valid payload', () => {
    const result = leadFormSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  describe('airtable_record_id', () => {
    it('accepts a non-empty string', () => {
      const result = leadFormSchema.safeParse({ ...validBase, airtable_record_id: 'rec_123' });
      expect(result.success).toBe(true);
    });

    it('accepts null', () => {
      const result = leadFormSchema.safeParse({ ...validBase, airtable_record_id: null });
      expect(result.success).toBe(true);
    });

    it('accepts being omitted entirely', () => {
      const { airtable_record_id, ...withoutField } = { ...validBase, airtable_record_id: undefined };
      const result = leadFormSchema.safeParse(withoutField);
      expect(result.success).toBe(true);
    });
  });

  describe('services', () => {
    it('accepts plain display-name strings, not just guids', () => {
      const result = leadFormSchema.safeParse({ ...validBase, services: ['Hair', 'Makeup'] });
      expect(result.success).toBe(true);
    });

    it('rejects an empty array', () => {
      const result = leadFormSchema.safeParse({ ...validBase, services: [] });
      expect(result.success).toBe(false);
    });
  });

  describe('makeupStyles', () => {
    it('accepts the longer style option strings without hitting a max-length limit', () => {
      // Regression guard for the earlier `max(10)` bug that would have
      // rejected these two real options from makeupStyleOptions.
      const result = leadFormSchema.safeParse({
        ...validBase,
        makeupStyles: ['South Asian style', 'Korean style'],
      });
      expect(result.success).toBe(true);
    });

    it('defaults to an empty array when omitted', () => {
      const result = leadFormSchema.safeParse(validBase);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.makeupStyles).toEqual([]);
      }
    });
  });

  describe('budget coercion', () => {
    it('coerces a numeric string to a number', () => {
      const result = leadFormSchema.safeParse({ ...validBase, budget: '750' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.budget).toBe(750);
      }
    });

    it('rejects a negative budget', () => {
      const result = leadFormSchema.safeParse({ ...validBase, budget: '-1' });
      expect(result.success).toBe(false);
    });

    it('rejects an empty string', () => {
      const result = leadFormSchema.safeParse({ ...validBase, budget: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('peopleCount coercion', () => {
    it('coerces a numeric string to a positive int', () => {
      const result = leadFormSchema.safeParse({ ...validBase, peopleCount: '6' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.peopleCount).toBe(6);
      }
    });

    it('rejects zero', () => {
      const result = leadFormSchema.safeParse({ ...validBase, peopleCount: '0' });
      expect(result.success).toBe(false);
    });
  });
});