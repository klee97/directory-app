export type FilterContext = {
  searchQuery: string | null;
  selectedSkills: string[];
  selectedServices: string[];
  travelsWorldwide: boolean;
  selectedLocationName?: string | null;
  lat?: number | null;
  lon?: number | null;
  sortOptionName?: string;
  resultCount?: number;
};