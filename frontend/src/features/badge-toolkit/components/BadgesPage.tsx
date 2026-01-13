import { getCachedVendor } from '@/lib/vendor/fetchVendors';
import { BadgesContent } from './BadgesContent';

export default async function BadgesPage({ params }: { params: { slug: string } }) {
  const vendor = await getCachedVendor(params.slug);
  
  return <BadgesContent vendor={vendor} slug={params.slug} />;
}