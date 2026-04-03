import VendorLogin from '@/features/login/components/VendorLogin';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Vendor Login | Asian Wedding Makeup',
  robots: {
    index: false,
    follow: false,
  },
}


export default function VendorLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VendorLogin />
    </Suspense>
  );
}
