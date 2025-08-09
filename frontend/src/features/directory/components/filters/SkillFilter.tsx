"use client"
import { useEffect, useMemo, useState } from "react";
import { SKILL_PARAM } from "@/lib/constants";
import { SKILL_FILTER_NAME, trackFilterEvent } from "@/utils/analytics/trackFilterEvents";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Checkbox, FormControlLabel, Typography } from "@mui/material";
import { useURLFiltersContext } from "@/contexts/URLFiltersContext";

export function SkillFilter({ tags, filterMinWidth }:
  {
    tags: string[];
    filterMinWidth: number;
  }
) {
  const { getAllParams, setParams } = useURLFiltersContext();

  // Get the selected skills from URL params
  const selectedSkills = useMemo(() => getAllParams(SKILL_PARAM) || [], [getAllParams]);
  const [skills, setSkills] = useState<boolean[]>(tags.map((skill) => selectedSkills.includes(skill)));

  useEffect(() => {
    setSkills(tags.map((skill) => selectedSkills.includes(skill)));
  }, [selectedSkills, tags]);

  const handleChange = (index: number, skill: string, newState: boolean) => {
    const newSkills = [...skills];
    newSkills[index] = newState;
    setSkills(newSkills);

    const selectedSkills = tags.filter((_, i) => newSkills[i]);
    setParams({
      [SKILL_PARAM]: selectedSkills.length > 0 ? selectedSkills.join(",") : null
    });

    trackFilterEvent(SKILL_FILTER_NAME, skill);
  };

  return (
    <Accordion disableGutters={true} sx={{ minWidth: filterMinWidth }} >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography component="span">Skills</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ display: 'flex', flexDirection: 'column' }}>
        {tags.map((skill, index) => (
          <FormControlLabel
            key={skill}
            control={
              <Checkbox
                checked={skills[index]}
                onChange={(_event, checked) => { handleChange(index, skill, checked) }}
                color="primary"
              />
            }
            label={skill}
          />
        ))}

      </AccordionDetails>
    </Accordion>
  );
}
