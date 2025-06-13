"use client";

import { useRouter, usePathname, ReadonlyURLSearchParams } from "next/navigation";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { TRAVEL_PARAM } from "@/lib/constants";
import { trackFilterEvent, TRAVEL_FILTER_NAME } from "@/utils/analytics/trackFilterEvents";
import { Typography } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useEffect } from "react";

export default function TravelFilter({
  searchParams,
  filterMinWidth
}: {
  searchParams: ReadonlyURLSearchParams,
  filterMinWidth: number
}) {
  const router = useRouter();
  const pathname = usePathname();
  // Get the current value from URL (default to false if not set)
  const travelsWorldwideDefault = searchParams.get(TRAVEL_PARAM)?.toLowerCase() === "true";
  const [travelsWorldwide, setTravelsWorldwide] = React.useState<boolean>(travelsWorldwideDefault);

  useEffect(() => {
    setTravelsWorldwide(travelsWorldwideDefault);
  }, [travelsWorldwideDefault]);

  // Function to update the URL param
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTravelsWorldwide = event.target.checked;
    const params = new URLSearchParams(searchParams);

    if (newTravelsWorldwide) {
      setTravelsWorldwide(true);
      params.set(TRAVEL_PARAM, "true");
    } else {
      setTravelsWorldwide(false);
      params.delete(TRAVEL_PARAM); // Remove param if false
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    trackFilterEvent(TRAVEL_FILTER_NAME, newTravelsWorldwide.toString());
  };

  return (
    <Accordion disableGutters={true} sx={{ minWidth: filterMinWidth }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography component="span">Travel</Typography>
      </AccordionSummary>
      <AccordionDetails >
        <FormControlLabel
          control={
            <Checkbox checked={travelsWorldwide} onChange={handleToggle} color="primary" />
          }
          label="Travels worldwide"
        />
      </AccordionDetails>
    </Accordion>
  );
}
