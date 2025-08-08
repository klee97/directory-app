import { SKILL_PARAM, TRAVEL_PARAM } from '@/lib/constants';

export const clearFiltersFromURL = (
  searchParams: URLSearchParams, 
  routerPush: (url: string, options?: { scroll: boolean }) => void
) => {
  const newParams = new URLSearchParams(searchParams.toString());
  
  // Remove filter-related parameters
  newParams.delete(SKILL_PARAM);
  newParams.delete(TRAVEL_PARAM);
  
  // Navigate to the new URL while preserving scroll position
  routerPush(`?${newParams.toString()}`, { scroll: false });
};