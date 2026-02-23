import { Database } from "./supabase";

export type BackendVendorMedia = Database['public']['Tables']['vendor_media']['Row'];
export type BackendVendorMediaInsert = Database['public']['Tables']['vendor_media']['Insert'];

export type VendorMedia = Pick<BackendVendorMedia, 'id'
  | 'consent_given'
  | 'credits'
  | 'media_url'
  | 'is_featured'
  | 'vendor_id'
> & {
  source: string,
  original_url: string,
}

export type VendorMediaDraft = VendorMediaBase & {
  id?: never; // Explicitly not persisted yet
};

export type VendorMediaExisting = VendorMediaBase & {
  id: string; // Came from the DB — an update or delete is possible
};

export type VendorMediaForm = VendorMediaDraft | VendorMediaExisting;

export type VendorMediaBase = Pick<VendorMedia,
  | 'vendor_id'
  | 'media_url'
  | 'consent_given'
  | 'credits'
  | 'is_featured'
>;

// --- Discriminated union for media mutations ---

export type VendorMediaCreate = VendorMediaBase & {
  operation: 'create';
  // No id — the DB assigns it
};

export type VendorMediaUpdate = VendorMediaBase & {
  operation: 'update';
  id: string; // Required — we need to know which row to update
};

export type VendorMediaDelete = Pick<VendorMediaBase, 'media_url'> & {
  operation: 'delete';
  id: string; // Only need the id to delete
};

export type VendorMediaMutation =
  | VendorMediaCreate
  | VendorMediaUpdate
  | VendorMediaDelete;