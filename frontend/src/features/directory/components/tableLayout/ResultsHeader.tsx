import { LocationResult } from "@/types/location";
import { SORT_OPTIONS, SortOption } from "@/types/sort";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { FilterPillsRow } from "./FilterPillsRow";
import { ResultsCount } from "./ResultsCount";


export const ResultsHeader = ({
  loading,
  resultCount,
  selectedLocation,
  sortOption,
  onSortChange,
  serviceTags,
  skillTags,
}: {
  loading: boolean,
  resultCount: number,
  selectedLocation: LocationResult | null,
  sortOption: SortOption,
  onSortChange: (sortOption: SortOption) => void,
  serviceTags: string[],
  skillTags: string[],
}) => {

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {/* Results Header Row */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 1,
        }}
      >
        <ResultsCount count={resultCount} loading={loading} location={selectedLocation} />
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <SortDropdown sortOption={sortOption} onChange={onSortChange} />
        </Box>
      </Box>
      {/* Filter Pills Row */}
      <FilterPillsRow
        serviceTags={serviceTags}
        skillTags={skillTags}
        loading={loading}
      />
    </Box>
  );
};

const SortDropdown = ({ sortOption, onChange }: {
  sortOption: SortOption,
  onChange: (sortOption: SortOption) => void,
}) => (
  <FormControl sx={{ minWidth: 200 }}>
    <Select
      value={sortOption.name}
      onChange={(e) => {
        const selected = Object.values(SORT_OPTIONS).find(opt => opt.name === e.target.value);
        if (selected) onChange(selected);
      }}
      renderValue={() => `Sort by: ${sortOption.display}`}
      size="small"
    >
      {Object.values(SORT_OPTIONS).map((option) => (
        <MenuItem key={option.name} value={option.name}>
          {option.display}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);