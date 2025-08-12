"use client"
import { useEffect, useMemo, useState } from "react";
import { SERVICE_PARAM } from "@/lib/constants";
import { SERVICE_FILTER_NAME, trackFilterEvent } from "@/utils/analytics/trackFilterEvents";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Checkbox, FormControlLabel, Typography } from "@mui/material";
import { useURLFiltersContext } from "@/contexts/URLFiltersContext";

export function ServiceFilter({ tags, filterMinWidth }:
  {
    tags: string[];
    filterMinWidth: number;
  }
) {
  const { getAllParams, setArrayParam } = useURLFiltersContext();

  // Get the selected services from URL params
  const selectedServices = useMemo(() => getAllParams(SERVICE_PARAM) || [], [getAllParams]);
  const [services, setServices] = useState<boolean[]>(tags.map((service) => selectedServices.includes(service)));

  useEffect(() => {
    setServices(tags.map((service) => selectedServices.includes(service)));
  }, [selectedServices, tags]);

  const handleChange = (index: number, service: string, newState: boolean) => {
    const newServices = [...services];
    newServices[index] = newState;
    setServices(newServices);

    const selectedServices = tags.filter((_, i) => newServices[i]);
    setArrayParam(SERVICE_PARAM, selectedServices.length > 0 ? selectedServices : null);

    trackFilterEvent(SERVICE_FILTER_NAME, service);
  };

  return (
    <Accordion disableGutters={true} sx={{ minWidth: filterMinWidth }} >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography component="span">Services</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ display: 'flex', flexDirection: 'column' }}>
        {tags.map((service, index) => (
          <FormControlLabel
            key={service}
            control={
              <Checkbox
                checked={services[index]}
                onChange={(_event, checked) => { handleChange(index, service, checked) }}
                color="primary"
              />
            }
            label={service}
          />
        ))}

      </AccordionDetails>
    </Accordion>
  );
}
