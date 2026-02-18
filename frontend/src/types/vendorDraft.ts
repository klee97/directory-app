import { Database } from "./supabase";

export type BackendVendorDraft = Database['public']['Tables']['vendor_drafts']['Row'];
export type BackendVendorDraftInsert = Database['public']['Tables']['vendor_drafts']['Insert'];
