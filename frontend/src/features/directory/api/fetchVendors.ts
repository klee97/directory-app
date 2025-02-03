import { supabase } from '@/lib/api-client';

export async function fetchAllVendors() {
  try {
    console.log("Fetching vendors");
    const { data } = await supabase
      .from('vendors_test')
      .select('*');

    if (data === null) {
      return [];
    }
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}