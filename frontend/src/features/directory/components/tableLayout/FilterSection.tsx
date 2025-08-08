import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { SkillFilter } from "../filters/SkillFilter";
import TravelFilter from "../filters/TravelFilter";
import { ReadonlyURLSearchParams } from "next/navigation";


export const FilterSection = ({ tags, searchParams, onClearFilters, filterMinWidth }:
  {
    tags: string[];
    searchParams: ReadonlyURLSearchParams;
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
    <SkillFilter tags={tags} searchParams={searchParams} filterMinWidth={filterMinWidth} />
    <TravelFilter searchParams={searchParams} filterMinWidth={filterMinWidth} />
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