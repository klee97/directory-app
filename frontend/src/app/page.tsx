import { Directory } from '@/features/directory/components/Directory';
import { fetchAllVendors } from '@/features/directory/api/fetchVendors';
import { unstable_cache } from 'next/cache';

const getCachedVendors = unstable_cache(fetchAllVendors);

export default async function Home() {
  const vendors = await getCachedVendors();

  return (
    <>
      <title>Hair and Makeup Directory for Asian Brides</title>
      <div className="flex items-center bg-white overflow-y">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8 lg:py-16">
          <Directory vendors={vendors} />
        </div>
      </div>
    </>
  );
}
