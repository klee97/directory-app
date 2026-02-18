import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { VendorMediaMutation } from '@/types/vendorMedia';

export async function applyVendorMediaMutation(
  supabase: SupabaseClient<Database>,
  mutation: VendorMediaMutation,
) {
  switch (mutation.operation) {
    case 'create': {
      const { operation, ...insertPayload } = mutation;
      return supabase
        .from('vendor_media')
        .insert(insertPayload);
    }

    case 'update': {
      const { operation, id, ...updatePayload } = mutation;
      return supabase
        .from('vendor_media')
        .update(updatePayload)
        .eq('id', id);
    }

    case 'delete': {
      return supabase
        .from('vendor_media')
        .delete()
        .eq('id', mutation.id);
    }

    default:
      // TypeScript will error here if you ever add a new operation and forget to handle it
      mutation satisfies never;
      throw new Error(`Unhandled operation: ${(mutation as any).operation}`);
  }
}