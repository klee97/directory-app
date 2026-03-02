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
  const services = useMemo(
    () => tags.map((service) => selectedServices.includes(service)),
    [tags, selectedServices]
  );

  const handleChange = (_index: number, service: string, checked: boolean) => {
    const newSelectedServices = checked
      ? [...selectedServices, service]
      : selectedServices.filter((s) => s !== service);

    setArrayParam(SERVICE_PARAM, newSelectedServices.length > 0 ? newSelectedServices : null);
    trackFilterEvent(SERVICE_FILTER_NAME, service);

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
