"use client";

import { useRouter, usePathname, ReadonlyURLSearchParams } from "next/navigation";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { TRAVEL_PARAM } from "@/lib/constants";
import { trackFilterEvent, TRAVEL_FILTER_NAME } from "@/utils/analytics/trackFilterEvents";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";

export default function TravelFilter({ searchParams }: { searchParams: ReadonlyURLSearchParams }) {
  const router = useRouter();
  const pathname = usePathname();

  // Get the current value from URL (default to false if not set)
  const travelsWorldwide = searchParams.get(TRAVEL_PARAM)?.toLowerCase() === "true";

  // Function to update the URL param
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTravelsWorldwide = event.target.checked;
    const params = new URLSearchParams(searchParams);

    if (newTravelsWorldwide) {
      params.set(TRAVEL_PARAM, "true");
    } else {
      params.delete(TRAVEL_PARAM); // Remove param if false
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    trackFilterEvent(TRAVEL_FILTER_NAME, newTravelsWorldwide.toString());
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6">Travel</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormControlLabel
          control={
            <Checkbox checked={travelsWorldwide} onChange={handleToggle} color="primary" />
          }
          label="Travels Worldwide"
        />
      </AccordionDetails>
    </Accordion>

  );
}
