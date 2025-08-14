import { LocationResult } from "@/types/location";
import { SORT_OPTIONS, SortOption } from "@/types/sort";
import { useURLFiltersContext } from "@/contexts/URLFiltersContext";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { SERVICE_PARAM, SKILL_PARAM, TRAVEL_PARAM } from "@/lib/constants";
import FilterChip from "@/components/ui/FilterChip";

export const ResultsHeader = ({
  loading,
  resultCount,
  selectedLocation,
  sortOption,
  onSortChange,
}: {
  loading: boolean,
  resultCount: number,
  selectedLocation: LocationResult | null,
  sortOption: SortOption,
  onSortChange: (sortOption: SortOption) => void,
}) => {
  const { getAllParams, setParams } = useURLFiltersContext();

  // Get selected filters from URL params
  const selectedServices = getAllParams(SERVICE_PARAM) || [];
  const selectedSkills = getAllParams(SKILL_PARAM) || [];
  const selectedTravel = getAllParams(TRAVEL_PARAM) || [];

  const hasFilters = selectedServices.length > 0 || selectedSkills.length > 0 || selectedTravel.length > 0;

  // Function to remove a specific filter
  const handleRemoveFilter = (filterType: string, valueToRemove: string) => {
    const currentValues = getAllParams(filterType) || [];
    const newValues = currentValues.filter(value => value !== valueToRemove);

    setParams({
      [filterType]: newValues.length > 0 ? newValues.join(",") : null
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Results Header Row */}
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
      {/* Filter Pills Row */}
      {hasFilters && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            paddingBottom: 1
          }}
        >
          {/* Service Pills */}
          {selectedServices.map((service) => (
            <FilterChip
              chipKey={`service-${service}`}
              label={service}
              onDelete={() => handleRemoveFilter(SERVICE_PARAM, service)}
              color={'primary'}
              size={'small'}
              disabled={loading}
            />
          ))}

          {/* Skill Pills */}
          {selectedSkills.map((skill) => (
            <FilterChip
              key={`skill-${skill}`}
              label={skill}
              onDelete={() => handleRemoveFilter(SKILL_PARAM, skill)}
              color={'info'}
              size={'small'}
              disabled={loading}
            />
          ))}

          {/* Travel Pills */}
          {selectedTravel.map((travel) => (
            <FilterChip
              key={`travel-${travel}`}
              label={'Travels Worldwide'}
              onDelete={() => handleRemoveFilter(TRAVEL_PARAM, travel)}
              color={'default'}
              size={'small'}
              disabled={loading}
            />
          ))}
        </Box>
      )}
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