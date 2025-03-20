"use client";
import { Vendor } from '@/types/vendor';
import { VendorGrid } from '@/features/directory/components/VendorGrid';
import { useState } from 'react';

export default function FavoriteTable({ favoriteVendors }: {
  favoriteVendors: Vendor[]
}) {

  const [focusedCardIndex, setFocusedCardIndex] = useState<number | null>(null);


  const handleFocus = (index: number) => {
    setFocusedCardIndex(index);
  };

  const handleBlur = () => {
    setFocusedCardIndex(null);
  };
  return (
    <div>
      <VendorGrid
        vendors={favoriteVendors}
        searchParams=''
        handleBlur={handleBlur}
        handleFocus={handleFocus}
        focusedCardIndex={focusedCardIndex}
      />
    </div>
  );
};