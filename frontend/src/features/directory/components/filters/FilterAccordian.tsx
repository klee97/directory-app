"use client"
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import { ReactNode } from "react";

export function FilterAccordion({
  title,
  filterMinWidth,
  children,
}: {
  title: string;
  filterMinWidth: number;
  children: ReactNode;
}) {
  const id = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <Accordion
      disableGutters={true}
      sx={{
        minWidth: filterMinWidth,
        '&:before': {
          display: 'none', // kill MUI's animated divider pseudo-element
        },
        border: '1px solid',
        borderColor: 'divider',
        '&:not(:last-child)': {
          borderBottom: 0, // avoid doubled borders between stacked accordions
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${id}-panel-content`}
        id={`${id}-panel-header`}
      >
        <Typography component="span">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ display: 'flex', flexDirection: 'column' }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}