"use client"
import { SORT_OPTIONS, SortOption } from "@/types/sort";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { FilterAccordion } from "./FilterAccordian";
import { useScrollToTopOnMobile } from "../../hooks/useScrollToTopOnMobile";

export function SortFilter({ sortOption, onChange, filterMinWidth }: {
  sortOption: SortOption;
  onChange: (sortOption: SortOption) => void;
  filterMinWidth: number;
}) {
  const scrollToTopOnMobile = useScrollToTopOnMobile();

  const handleChange = (name: string) => {
    const selected = Object.values(SORT_OPTIONS).find((opt) => opt.name === name);
    if (selected) {
      onChange(selected);
      scrollToTopOnMobile();
    }
  };

  return (
    <FilterAccordion title="Sort by" filterMinWidth={filterMinWidth}>
      <RadioGroup value={sortOption.name} onChange={(_e, value) => handleChange(value)}>
        {Object.values(SORT_OPTIONS).map((option) => (
          <FormControlLabel
            key={option.name}
            value={option.name}
            control={<Radio color="primary" />}
            label={option.display}
          />
        ))}
      </RadioGroup>
    </FilterAccordion>
  );
}