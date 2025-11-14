import { hasTagByName, VendorSpecialty } from '@/types/tag';
import { VendorTag } from '@/types/vendor';

export function getDefaultBio({ businessName, tags, location }: {
  businessName: string | null;
  tags: VendorTag[];
  location: string | null;
}): string {
  const name = (businessName || 'This artist').trim();

  const locationPhrase = location
    ? ` and based in${location.toLowerCase().includes('area') ? ' the' : ''} ${location}`
    : '';

  // Fallback if specialties not available
  if (!tags) {
    return `${name} specializes in Asian features${locationPhrase}.`;
  }

  const hasHair = hasTagByName(tags, VendorSpecialty.SPECIALTY_HAIR);
  const hasMakeup = hasTagByName(tags, VendorSpecialty.SPECIALTY_MAKEUP);

  let hairAndMakeup = '';

  if (hasHair && hasMakeup) {
    hairAndMakeup = ' hair and makeup';
  } else if (hasHair) {
    hairAndMakeup = ' hair';
  } else if (hasMakeup) {
    hairAndMakeup = ' makeup';
  }

  return `${name} is a${hairAndMakeup} artist specializing in Asian features${locationPhrase}.`;
}