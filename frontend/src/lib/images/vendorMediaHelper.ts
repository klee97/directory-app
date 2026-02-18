import type { VendorMediaForm } from '@/types/vendorMedia';
import type { VendorMediaMutation } from '@/types/vendorMedia';

export function deriveMediaMutations(
  draftImages: VendorMediaForm[],
  existingRows: { id: string }[],
): VendorMediaMutation[] {
  const mutations: VendorMediaMutation[] = [];

  // Rows in the draft with an id → update if changed, skip if same
  for (const draftImage of draftImages) {
    if (draftImage.id) {
      const existing = existingRows.find(r => r.id === draftImage.id);
      if (!existing) continue; // shouldn't happen, but safe to skip
      mutations.push({ operation: 'update', ...draftImage });
    } else {
      // No id → new row to create
      mutations.push({ operation: 'create', ...draftImage });
    }
  }

  // Rows in the DB that are no longer in the draft → delete
  const draftIds = new Set(draftImages.map(i => i.id).filter(Boolean));
  for (const existing of existingRows) {
    if (!draftIds.has(existing.id)) {
      mutations.push({ operation: 'delete', id: existing.id });
    }
  }

  return mutations;
}