"use client";
import InputWithDebounce from '@/components/ui/InputWithDebounce';
import { trackSearchQuery } from '@/utils/analytics/trackFilterEvents';

export function SearchBar({
  value,
  onChange
}: {
  value: string,
  onChange: (newQuery: string) => void
}) {
  const handleChange = (val: string) => {
    console.debug('SearchBar handleChange:', val);
  };

  const handleDebouncedChange = (val: string, prev: string) => {
    onChange(val);  // This now calls updateSearchQuery directly
    trackSearchQuery(val, prev);
  };

  return (
    <InputWithDebounce
      value={value}
      onChange={handleChange}
      onDebouncedChange={handleDebouncedChange}
      placeholder="Artist Name"
      debounceMs={500}
    />
  );
}
