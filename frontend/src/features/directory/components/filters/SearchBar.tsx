"use client";
import { ReadonlyURLSearchParams, usePathname, useRouter } from 'next/navigation';
import { SEARCH_PARAM } from '@/lib/constants';
import { trackSearchQuery } from '@/utils/analytics/trackFilterEvents';
import InputWithDebounce from '@/components/ui/InputWithDebounce';

export function SearchBar({ searchParams }: { searchParams: ReadonlyURLSearchParams }) {
  const pathname = usePathname();
  const { replace } = useRouter();

  const searchParamValue = searchParams.get(SEARCH_PARAM) || '';

  const handleChange = (val: string) => {
    console.debug('SearchBar handleChange:', val);
  };

  const handleDebouncedChange = (val: string, prev: string) => {
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set(SEARCH_PARAM, val);
    } else {
      params.delete(SEARCH_PARAM);
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
    trackSearchQuery(val, prev);
  };

  return (
    <InputWithDebounce
      value={searchParamValue}
      onChange={handleChange}
      onDebouncedChange={handleDebouncedChange}
      placeholder="Artist name"
      debounceMs={500}
    />
  );
}
