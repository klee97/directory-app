import { VendorMediaForm, VendorMediaMutation } from "@/types/vendorMedia";

export function formMediaToMutation(
  media: VendorMediaForm,
  deleted: boolean
): VendorMediaMutation {
  if (deleted) {
    if (!media.id) throw new Error('Cannot delete a draft that was never saved');
    return { operation: 'delete', id: media.id, media_url: media.media_url };
  }

  if (media.id) {
    return { operation: 'update', ...media };
  }

  return { operation: 'create', ...media };
}