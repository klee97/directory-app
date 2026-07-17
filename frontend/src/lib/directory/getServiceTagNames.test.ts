import { describe, it, expect } from 'vitest';
import { VendorTag } from '@/types/vendor';
import { getSelectedServiceLabels } from './getServiceTagNames';

const HAIR_TAG_ID = 'e2e00000-0000-0000-0000-000000000001';
const MAKEUP_TAG_ID = 'e2e00000-0000-0000-0000-000000000003';

const serviceOptions: VendorTag[] = [
  { id: HAIR_TAG_ID, name: "SPECIALTY_HAIR", display_name: 'Hair', style: 'primary', type: 'SERVICE', is_visible: true },
  { id: MAKEUP_TAG_ID, name: "SPECIALTY_MAKEUP", display_name: 'Makeup', style: 'primary', type: 'SERVICE', is_visible: true },
];

describe('getSelectedServiceLabels', () => {
  it('translates selected ids to their display names', () => {
    expect(getSelectedServiceLabels([HAIR_TAG_ID, MAKEUP_TAG_ID], serviceOptions)).toEqual([
      'Hair',
      'Makeup',
    ]);
  });

  it('preserves the order of selectedIds, not serviceOptions', () => {
    expect(getSelectedServiceLabels([MAKEUP_TAG_ID, HAIR_TAG_ID], serviceOptions)).toEqual([
      'Makeup',
      'Hair',
    ]);
  });

  it('returns an empty array when nothing is selected', () => {
    expect(getSelectedServiceLabels([], serviceOptions)).toEqual([]);
  });

  it('drops ids that have no matching service option', () => {
    expect(getSelectedServiceLabels([HAIR_TAG_ID, 'tag-stale'], serviceOptions)).toEqual(['Hair']);
  });

  it('returns an empty array when none of the selected ids match', () => {
    expect(getSelectedServiceLabels(['tag-stale-1', 'tag-stale-2'], serviceOptions)).toEqual([]);
  });

  it('returns an empty array when there are no service options at all', () => {
    expect(getSelectedServiceLabels([HAIR_TAG_ID], [])).toEqual([]);
  });
});