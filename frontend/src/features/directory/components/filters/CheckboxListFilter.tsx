"use client"
import { useMemo } from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { trackFilterEvent } from "@/utils/analytics/trackFilterEvents";
import { useURLFiltersContext } from "@/contexts/URLFiltersContext";
import { FilterAccordion } from "./FilterAccordian";
import { useScrollToTopOnMobile } from "../../hooks/useScrollToTopOnMobile";

export function CheckboxListFilter({
  title,
  paramKey,
  tags,
  filterMinWidth,
  analyticsFilterName,
}: {
  title: string;
  paramKey: string;
  tags: string[];
  filterMinWidth: number;
  analyticsFilterName: string;
}) {
  const { getSanitizedArrayParam, setArrayParam } = useURLFiltersContext();
  const scrollToTopOnMobile = useScrollToTopOnMobile();

  const selected = useMemo(() => getSanitizedArrayParam(paramKey, tags) || [], [getSanitizedArrayParam, paramKey]);
  const checkedFlags = useMemo(
    () => tags.map((tag) => selected.includes(tag)),
    [tags, selected]
  );

  const handleChange = (tag: string, checked: boolean) => {
    const newSelected = checked
      ? [...selected, tag]
      : selected.filter((s) => s !== tag);

    setArrayParam(paramKey, newSelected.length > 0 ? newSelected : null);
    trackFilterEvent(analyticsFilterName, tag);
    scrollToTopOnMobile();
  };

  return (
    <FilterAccordion title={title} filterMinWidth={filterMinWidth}>
      {tags.map((tag, index) => (
        <FormControlLabel
          key={tag}
          control={
            <Checkbox
              checked={checkedFlags[index]}
              onChange={(_e, checked) => handleChange(tag, checked)}
              color="primary"
            />
          }
          label={tag}
        />
      ))}
    </FilterAccordion>
  );
}