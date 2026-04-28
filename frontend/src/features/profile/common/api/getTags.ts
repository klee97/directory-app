import { unstable_cache } from 'next/cache';
import { supabaseStaticClient } from '@/lib/supabase/clients/staticClient';
import { VendorTag } from '@/types/vendor';


const _getTags = unstable_cache(
  async (): Promise<VendorTag[]> => {
    console.debug('[Cache] Fetching visible vendor tags');

    const { data, error } = await supabaseStaticClient
      .from('tags')
      .select('id, name, display_name, is_visible, style, type')
      .eq('is_visible', true)
      .order('display_name', { ascending: true });

    if (error) {
      console.error('[Cache] Error fetching tags:', error);
      throw new Error('Failed to fetch vendor tags'); // prevents caching null/invalid
    }

    if (!data || data.length === 0) {
      console.warn('[Cache] No tags returned from database');
      return []; // cache empty array if intentional
    }

    console.debug('[Cache] Returned', data.length, 'tags');
    return data;
  },
  ['tags', 'all-vendors'],
  { revalidate: 3600 * 24 } // cache for 24 hours
);

export async function getTags(): Promise<VendorTag[]> {
  try {
    return await _getTags();
  } catch (err) {
    console.error('[Cache] Failed to fetch tags:', err);
    return [];
  }
}