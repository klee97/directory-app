"use client"
import { useMemo } from "react";
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
  const { getAllParams, setArrayParam } = useURLFiltersContext();

  // Get the selected skills from URL params
  const selectedSkills = useMemo(() => getAllParams(SKILL_PARAM) || [], [getAllParams]);
  const skills = useMemo(
    () => tags.map((skill) => selectedSkills.includes(skill)),
    [tags, selectedSkills]
  );

  const handleChange = (skill: string, checked: boolean) => {
    // add or remove skill
    const newSelectedSkills = checked
      ? [...selectedSkills, skill]
      : selectedSkills.filter((s) => s !== skill);
    setArrayParam(SKILL_PARAM, newSelectedSkills.length > 0 ? newSelectedSkills : null);

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
                onChange={(_event, checked) => { handleChange(skill, checked) }}
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
