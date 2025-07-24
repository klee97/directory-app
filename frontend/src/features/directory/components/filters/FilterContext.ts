export type FilterContext = {
  searchQuery: string | null;
  selectedSkills: string[];
  travelsWorldwide: boolean;
  selectedLocationName: string | null;
  sortOptionName?: string;
  resultCount?: number;
};