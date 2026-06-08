import { getInquiryState } from './getInquiryState';
import { describe, it, expect } from "vitest";

describe('getInquiryState', () => {
  it('returns opted_out when opted-out timestamp exists', () => {
    expect(getInquiryState('2026-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z')).toBe('opted_out');
  });

  it('returns verified when not opted out and verified exists', () => {
    expect(getInquiryState(null, '2026-01-02T00:00:00.000Z')).toBe('verified');
  });

  it('returns unclaimed when neither timestamp exists', () => {
    expect(getInquiryState(null, null)).toBe('unclaimed');
  });
});