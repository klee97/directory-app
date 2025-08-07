"use client"
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SERVICE_PARAM } from "@/lib/constants";
import { ReadonlyURLSearchParams } from "next/navigation";
import { SERVICE_FILTER_NAME, trackFilterEvent } from "@/utils/analytics/trackFilterEvents";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Checkbox, FormControlLabel, Typography } from "@mui/material";

export function ServiceFilter({ tags, searchParams, filterMinWidth }:
  {
    tags: string[];
    searchParams: ReadonlyURLSearchParams;
    filterMinWidth: number;
  }
) {
  const router = useRouter();
  // Get the selected services from URL params
  const selectedServices = useMemo(() => searchParams.getAll(SERVICE_PARAM) || [], [searchParams]);
  const [services, setServices] = useState<boolean[]>(tags.map((service) => selectedServices.includes(service)));

  useEffect(() => {
    setServices(tags.map((service) => selectedServices.includes(service)));
  }, [selectedServices, tags]);

  const handleChange = (index: number, service: string, newState: boolean) => {
    const newServices = [...services];
    newServices[index] = newState;
    setServices(newServices);

    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete(SERVICE_PARAM);
    tags.map((service, index) => {
      if (newServices[index]) {
        newParams.append(SERVICE_PARAM, service);
      }
    });

    // Use router.push() to update the URL while keeping other params
    router.push(`?${newParams.toString()}`, { scroll: false });
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
