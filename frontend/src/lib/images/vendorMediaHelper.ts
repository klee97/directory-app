import type { VendorMediaForm } from '@/types/vendorMedia';
import type { VendorMediaMutation } from '@/types/vendorMedia';

export function deriveMediaMutations(
  draftImages: VendorMediaForm[],
  existingRows: { id: string, media_url: string }[],
): VendorMediaMutation[] {
  const mutations: VendorMediaMutation[] = [];

  console.debug("Deriving media mutations...");
  console.debug("Draft images:", draftImages);
  console.debug("Existing DB rows:", existingRows);
  // Rows in the draft with an id → update if changed, skip if same
  for (const draftImage of draftImages) {
    if (draftImage.id) {
      // Has id — update if it exists in DB
      const existing = existingRows.find(r => r.id === draftImage.id);
      if (!existing) continue; // shouldn't happen, but safe to skip
      mutations.push({ operation: 'update', ...draftImage });
    } else {
      // No id — check if the same URL already exists in DB (e.g. unchanged image)
      const existingByUrl = existingRows.find(r => r.media_url === draftImage.media_url);
      if (existingByUrl) {
        // Same image, just missing id in draft — treat as update
        mutations.push({ operation: 'update', ...draftImage, id: existingByUrl.id });
      } else {
        // Genuinely new image
        mutations.push({ operation: 'create', ...draftImage });
      }
    }
  }

  // Rows in the DB that are no longer in the draft → delete
  const draftIds = new Set(draftImages.map(i => i.id).filter(Boolean));
  const draftUrls = new Set(draftImages.map(i => i.media_url));
  for (const existing of existingRows) {
    if (!draftIds.has(existing.id) && !draftUrls.has(existing.media_url)) {
      mutations.push({ operation: 'delete', id: existing.id, media_url: existing.media_url });
    }
  }

  return mutations;
}