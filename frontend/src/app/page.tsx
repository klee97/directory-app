import { Directory } from '@/features/directory/components/Directory';
import { fetchAllVendors } from '@/features/directory/api/fetchVendors';
import { unstable_cache } from 'next/cache';

const getCachedVendors = unstable_cache(fetchAllVendors);

export default async function Home(props: {
  searchParams?: Promise<{
    query?: string;
  }>;
}) {
  const vendors = await getCachedVendors();
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';

  return (
    <>
      <title>Hair and Makeup Directory for Asian Brides</title>
      <div className="flex items-center bg-white overflow-y">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8 lg:py-16">
          <Directory vendors={vendors} searchQuery={query} />
        </div>
      </div>
    </>
  );
}
