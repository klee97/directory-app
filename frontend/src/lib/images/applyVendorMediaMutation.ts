import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { VendorMediaMutation } from '@/types/vendorMedia';

export async function applyVendorMediaMutation(
  supabase: SupabaseClient<Database>,
  mutation: VendorMediaMutation,
) {
  console.debug(`Applying media mutation: ${mutation.operation}`);
  switch (mutation.operation) {
    case 'create': {
      console.debug("Creating new media for vendor ID:", mutation.vendor_id);
      const { operation: _operation, ...insertPayload } = mutation;
      return supabase
        .from('vendor_media')
        .insert(insertPayload);
    }

    case 'update': {
      console.debug("Updating media for vendor ID:", mutation.vendor_id);
      const { operation: _operation, id, ...updatePayload } = mutation;
      return supabase
        .from('vendor_media')
        .update(updatePayload)
        .eq('id', id);
    }

    case 'delete': {
      console.debug("Deleting media for mutation ID:", mutation.id);
      return supabase
        .from('vendor_media')
        .delete()
        .eq('id', mutation.id);
    }

    default: {
      // Ensure exhaustiveness for future operation types
      const _exhaustiveCheck: never = mutation as never;
      throw new Error(`Unhandled operation: ${JSON.stringify(mutation)}`);
    }
  }
}