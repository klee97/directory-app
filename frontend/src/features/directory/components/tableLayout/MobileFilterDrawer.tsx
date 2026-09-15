"use client"
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import { SkillFilter } from "@/features/directory/components/filters/SkillFilter";
import TravelFilter from "@/features/directory/components/filters/TravelFilter";
import { ServiceFilter } from "@/features/directory/components/filters/ServiceFilter";
import { SortFilter } from "@/features/directory/components/filters/SortFilter";
import { FilterTags } from "@/lib/directory/filterTags";
import { SORT_OPTIONS, SortOption } from "@/types/sort";

interface MobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  tags: FilterTags;
  onClearFilters: () => void;
  filterMinWidth: number;
  sortOption: SortOption;
  onSortChange: (sortOption: SortOption) => void;
}

export const MobileFilterDrawer = ({
  open,
  onClose,
  tags,
  onClearFilters,
  filterMinWidth,
  sortOption,
  onSortChange,
}: MobileFilterDrawerProps) => {
  const handleClearAll = () => {
    onClearFilters();
    onSortChange(SORT_OPTIONS.DEFAULT);
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }
        }
      }}
    >
      <Box sx={{ overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
        <SortFilter
          sortOption={sortOption}
          onChange={onSortChange}
          filterMinWidth={filterMinWidth}
        />
        <ServiceFilter tags={tags.services} filterMinWidth={filterMinWidth} />
        <SkillFilter tags={tags.skills} filterMinWidth={filterMinWidth} />
        <TravelFilter filterMinWidth={filterMinWidth} />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          pb: 'calc(16px + env(safe-area-inset-bottom))',
          bgcolor: 'background.paper',
          boxShadow: '0px -4px 12px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Button
          onClick={handleClearAll}
          sx={{
            textDecoration: 'underline',
            color: 'text.secondary',
            fontWeight: 600,
            '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' },
          }}
        >
          Clear all
        </Button>

        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: 'primary.main',
            color: 'common.white',
            px: 4,
          }}
        >
          Done
        </Button>
      </Box>
    </Drawer>
  )
}