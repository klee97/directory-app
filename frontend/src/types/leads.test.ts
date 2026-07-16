import { describe, it, expect } from 'vitest';
import { leadFormSchema } from './leadsValidation';

const HAIR_TAG_ID = 'e2e00000-0000-0000-0000-000000000001';
const MAKEUP_TAG_ID = 'e2e00000-0000-0000-0000-000000000002';

const validPayload = {
  vendor_id: 'vendor-123',
  isTestRecord: true,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  additionalDetails: 'Looking for a natural bridal look.',
  weddingDate: '2027-06-12',
  flexibleDate: false,
  location: 'Boston, MA',
  budget: '500',
  peopleCount: '4',
  flexibleCount: false,
  services: [HAIR_TAG_ID, MAKEUP_TAG_ID],
  makeupStyles: ['Natural'],
};

describe('leadFormSchema', () => {
  it('accepts a fully valid payload', () => {
    const result = leadFormSchema.parse(validPayload);
    expect(result.vendor_id).toBe('vendor-123');
    expect(result.services).toEqual([HAIR_TAG_ID, MAKEUP_TAG_ID]);
  });

  it('coerces budget and peopleCount from string to number', () => {
    const result = leadFormSchema.parse(validPayload);
    expect(result.budget).toBe(500);
    expect(typeof result.budget).toBe('number');
    expect(result.peopleCount).toBe(4);
    expect(typeof result.peopleCount).toBe('number');
  });

  it('defaults isTestRecord, flexibleDate, flexibleCount, makeupStyles', () => {
    const { isTestRecord, flexibleDate, flexibleCount, makeupStyles, ...rest } =
      validPayload;
    const result = leadFormSchema.parse(rest);
    expect(result.isTestRecord).toBe(false);
    expect(result.flexibleDate).toBe(false);
    expect(result.flexibleCount).toBe(false);
    expect(result.makeupStyles).toEqual([]);
  });

  it.each([
    ['vendor_id', ''],
    ['firstName', ''],
    ['lastName', ''],
    ['location', ''],
    ['additionalDetails', ''],
  ])('rejects empty required field %s', (field, value) => {
    const payload = { ...validPayload, [field]: value };
    expect(() => leadFormSchema.parse(payload)).toThrow();
  });

  it('rejects an invalid email', () => {
    const payload = { ...validPayload, email: 'not-an-email' };
    expect(() => leadFormSchema.parse(payload)).toThrow();
  });

  it('rejects a malformed weddingDate', () => {
    const payload = { ...validPayload, weddingDate: '06/12/2027' };
    expect(() => leadFormSchema.parse(payload)).toThrow();
  });

  it('allows weddingDate to be omitted', () => {
    const { weddingDate, ...rest } = validPayload;
    expect(() => leadFormSchema.parse(rest)).not.toThrow();
  });

  it('rejects a negative budget', () => {
    const payload = { ...validPayload, budget: '-1' };
    expect(() => leadFormSchema.parse(payload)).toThrow();
  });

  it.each(['', '   '])('rejects a blank budget value %p', (value) => {
    const payload = { ...validPayload, budget: value };
    expect(() => leadFormSchema.parse(payload)).toThrow();
  });

  it('rejects a non-numeric budget', () => {
    const payload = { ...validPayload, budget: 'lots' };
    expect(() => leadFormSchema.parse(payload)).toThrow();
  });

  it('rejects peopleCount of zero or negative', () => {
    expect(() =>
      leadFormSchema.parse({ ...validPayload, peopleCount: '0' })
    ).toThrow();
    expect(() =>
      leadFormSchema.parse({ ...validPayload, peopleCount: '-2' })
    ).toThrow();
  });

  it('rejects an empty services array', () => {
    const payload = { ...validPayload, services: [] };
    expect(() => leadFormSchema.parse(payload)).toThrow();
  });
});