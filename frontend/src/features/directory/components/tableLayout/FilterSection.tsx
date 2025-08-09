import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { SkillFilter } from "../filters/SkillFilter";
import TravelFilter from "../filters/TravelFilter";


export const FilterSection = ({ tags, onClearFilters, filterMinWidth }:
  {
    tags: string[];
    onClearFilters: () => void;
    filterMinWidth: number;
  }
) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      alignItems: 'stretch',
      flexWrap: 'wrap',
    }}
  >
    <SkillFilter tags={tags} filterMinWidth={filterMinWidth} />
    <TravelFilter filterMinWidth={filterMinWidth} />
    {/* Second Row: Clear Button */}
    <Button
      variant="contained"
      onClick={onClearFilters}
      size="small"
      sx={{ width: { xs: '100%', sm: 'auto' } }}
    >
      Clear Filters
    </Button>
  </Box>
);