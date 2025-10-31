import { hasTagByName, VendorSpecialty } from '@/types/tag';
import { VendorTag } from '@/types/vendor';

export function getDefaultBio({ businessName, tags, location }: {
  businessName: string | null;
  tags: VendorTag[];
  location: string;
}): string {
  // Fallback if specialties not available
  if (!tags) {
    return `${businessName} is an artist specializing in Asian features and based in${location?.toLowerCase()?.includes('area') ? ' the' : ''} ${location || ''}.`;
  }
  return `${businessName} is a${hasTagByName(tags, VendorSpecialty.SPECIALTY_HAIR) ? ' hair' : ''}${tags.length === 2 ? ' and ' : ' '}${hasTagByName(tags, VendorSpecialty.SPECIALTY_MAKEUP) ? 'makeup' : ''} artist specializing in Asian features and based in${location?.toLowerCase()?.includes('area') ? ' the' : ''} ${location || ''}.`;
}
