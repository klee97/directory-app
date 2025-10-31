import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/api-client';
import { VendorTag } from '@/types/vendor';

export const getTags = unstable_cache(async (): Promise<VendorTag[]> => {
  const { data, error } = await supabase
    .from('tags')
    .select('id, name, display_name, is_visible, style, type')
    .eq('is_visible', true)
    .order('display_name', { ascending: true });
  if (error || !data) return [];
  return data;
}, ['tags'], { revalidate: 3600 * 24 }); // cache for 24 hours
