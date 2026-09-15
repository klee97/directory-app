import Box from "@mui/material/Box";
import { SERVICE_PARAM, SKILL_PARAM, TRAVEL_PARAM } from "@/lib/constants";
import { useURLFiltersContext } from "@/contexts/URLFiltersContext";
import FilterChip from "@/components/ui/FilterChip";

export const FilterPillsRow = ({
  serviceTags,
  skillTags,
  loading,
}: {
  serviceTags: string[];
  skillTags: string[];
  loading: boolean;
}) => {
  const { getSanitizedArrayParam, getBooleanParam, setArrayParam, setParam } = useURLFiltersContext();

  const selectedServices = getSanitizedArrayParam(SERVICE_PARAM, serviceTags) || [];
  const selectedSkills = getSanitizedArrayParam(SKILL_PARAM, skillTags) || [];
  const selectedTravel = getBooleanParam(TRAVEL_PARAM) || false;

  const hasFilters = selectedServices.length > 0 || selectedSkills.length > 0 || selectedTravel;

  const handleRemoveArrayFilter = (filterType: string, currentValues: string[], valueToRemove: string) => {
    const newValues = currentValues.filter((value) => value !== valueToRemove);
    setArrayParam(filterType, newValues.length > 0 ? newValues : null);
  };

  const handleRemoveTravelFilter = () => {
    setParam(TRAVEL_PARAM, null);
  };

  if (!hasFilters) return null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {selectedServices.map((service) => (
        <FilterChip
          key={`service-${service}`}
          data-testid={`filter-chip-service-${service}`}
          label={service}
          onDelete={() => handleRemoveArrayFilter(SERVICE_PARAM, selectedServices, service)}
          color={'primary'}
          size={'small'}
          disabled={loading}
        />
      ))}

      {selectedSkills.map((skill) => (
        <FilterChip
          key={`skill-${skill}`}
          data-testid={`filter-chip-skill-${skill}`}
          label={skill}
          onDelete={() => handleRemoveArrayFilter(SKILL_PARAM, selectedSkills, skill)}
          color={'info'}
          size={'small'}
          disabled={loading}
        />
      ))}

      {selectedTravel && (
        <FilterChip
          label={'Travels Worldwide'}
          onDelete={handleRemoveTravelFilter}
          color={'default'}
          size={'small'}
          disabled={loading}
        />
      )}
    </Box>
  );
};