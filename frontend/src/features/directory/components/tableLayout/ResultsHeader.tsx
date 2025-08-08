
import { LocationResult } from "@/types/location";
import { SORT_OPTIONS, SortOption } from "@/types/sort";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

export const ResultsHeader = ({
  loading,
  resultCount,
  selectedLocation,
  sortOption,
  onSortChange
}: {
  loading: boolean,
  resultCount: number,
  selectedLocation: LocationResult | null,
  sortOption: SortOption,
  onSortChange: (sortOption: SortOption) => void
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', md: 'center' },
      gap: 2,
    }}
  >
    <Typography variant="h6" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
      {loading ? <LoadingText /> : <ResultCountText count={resultCount} location={selectedLocation} />}
    </Typography>
    <SortDropdown sortOption={sortOption} onChange={onSortChange} />
  </Box>
);


const SortDropdown = ({sortOption, onChange } : {
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
)
const LoadingText = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <CircularProgress size={20} />
    Loading artists...
  </Box>
);

const ResultCountText = ({ count, location }:
  { count: number, location: LocationResult | null }
) => (
  <>
    {count} Wedding Beauty Artist{count === 1 ? '' : 's'} found
    {!!location && ` near ${location.display_name}`}
  </>
);