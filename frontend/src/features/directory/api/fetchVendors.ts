import { supabase } from '@/lib/api-client';
// import { sql } from '@vercel/postgres';
// import { client } from '@/lib/api-client';
// import { db } from "@vercel/postgres";

// const client = await db.connect();

export async function fetchVendors() {
  try {
    // const client = await sql.connect();
    console.log(process.env.POSTGRES_URL);
    const { data } = await supabase
      .from('vendors')
      .select('business_name, instagram, website');

    // const vendorCountPromise = sql`SELECT COUNT(*) FROM vendors`;
    // const data = await Promise.all([
    //   vendorCountPromise
    // ]);

    // const numberOfVendors = Number(data[0].rows[0].count ?? '0');
    // const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
    // const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');
    if (data === null) {
      return [];
    }
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}