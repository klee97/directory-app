"use client";

import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useState } from "react";
import { TRAVEL_PARAM } from "@/lib/constants";
import { trackFilterEvent, TRAVEL_FILTER_NAME } from "@/utils/analytics/trackFilterEvents";
import { useURLFiltersContext } from "@/contexts/URLFiltersContext";
import { FilterAccordion } from "./FilterAccordian";
import { useScrollToTopOnMobile } from "../../hooks/useScrollToTopOnMobile";

export default function TravelFilter({
  filterMinWidth
}: {
  filterMinWidth: number
}) {
  const { getBooleanParam, setParams } = useURLFiltersContext();

  // Get the current value from URL (default to false if not set)
  const travelsWorldwideDefault = getBooleanParam(TRAVEL_PARAM);
  const scrollToTopOnMobile = useScrollToTopOnMobile();
  const [prevDefault, setPrevDefault] = useState(travelsWorldwideDefault);
  const [travelsWorldwide, setTravelsWorldwide] = useState<boolean>(travelsWorldwideDefault);

  if (travelsWorldwideDefault !== prevDefault) {
    setPrevDefault(travelsWorldwideDefault);
    setTravelsWorldwide(travelsWorldwideDefault);
  }

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTravelsWorldwide = event.target.checked;
    setTravelsWorldwide(newTravelsWorldwide);

    setParams({ [TRAVEL_PARAM]: newTravelsWorldwide ? "true" : null });
    trackFilterEvent(TRAVEL_FILTER_NAME, newTravelsWorldwide.toString());
    scrollToTopOnMobile();
  };

  return (
    <FilterAccordion title="Travel" filterMinWidth={filterMinWidth}>
      <FormControlLabel
        control={<Checkbox checked={travelsWorldwide} onChange={handleToggle} color="primary" />}
        label="Travels worldwide"
      />
    </FilterAccordion>
  );
}