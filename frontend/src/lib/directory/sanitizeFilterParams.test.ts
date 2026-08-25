import { describe, expect, it } from 'vitest';
import { sanitizeFilterValues } from './sanitizeFilterParams';

describe('sanitizeFilterValues', () => {
  it('maps values to their canonical casing', () => {
    expect(sanitizeFilterValues(['makeup'], ['Makeup', 'Hair'])).toEqual(['Makeup']);
  });

  it('drops values with no case-insensitive match', () => {
    expect(sanitizeFilterValues(['nonsense'], ['Makeup', 'Hair'])).toEqual([]);
  });

  it('dedupes case-variant duplicates to a single canonical entry', () => {
    expect(sanitizeFilterValues(['Makeup', 'makeup', 'MAKEUP'], ['Makeup', 'Hair'])).toEqual(['Makeup']);
  });

  it('trims whitespace before matching', () => {
    expect(sanitizeFilterValues([' Makeup '], ['Makeup', 'Hair'])).toEqual(['Makeup']);
  });

  it('preserves the order values first appear in the input', () => {
    expect(sanitizeFilterValues(['Hair', 'Makeup'], ['Makeup', 'Hair'])).toEqual(['Hair', 'Makeup']);
  });

  it('returns an empty array for empty input', () => {
    expect(sanitizeFilterValues([], ['Makeup', 'Hair'])).toEqual([]);
  });
});