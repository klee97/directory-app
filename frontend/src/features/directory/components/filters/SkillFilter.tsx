"use client"
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SKILL_PARAM } from "@/lib/constants";
import { ReadonlyURLSearchParams } from "next/navigation";
import { SKILL_FILTER_NAME, trackFilterEvent } from "@/utils/analytics/trackFilterEvents";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Checkbox, FormControlLabel, Typography } from "@mui/material";

export function SkillFilter({ tags, searchParams, filterMinWidth }:
  {
    tags: string[];
    searchParams: ReadonlyURLSearchParams;
    filterMinWidth: number;
  }
) {
  const router = useRouter();
  // Get the selected skills from URL params
  const selectedSkills = useMemo(() => searchParams.getAll(SKILL_PARAM) || [], [searchParams]);
  const [skills, setSkills] = useState<boolean[]>(tags.map((skill) => selectedSkills.includes(skill)));

  useEffect(() => {
    setSkills(tags.map((skill) => selectedSkills.includes(skill)));
  }, [selectedSkills, tags]);

  const handleChange = (index: number, skill: string, newState: boolean) => {
    const newSkills = [...skills];
    newSkills[index] = newState;
    setSkills(newSkills);

    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete(SKILL_PARAM);
    tags.map((skill, index) => {
      if (newSkills[index]) {
        newParams.append(SKILL_PARAM, skill);
      }
    });

    // Use router.push() to update the URL while keeping other params
    router.push(`?${newParams.toString()}`, { scroll: false });
    trackFilterEvent(SKILL_FILTER_NAME, skill);
  };

  return (
    <Accordion sx={{ minWidth: filterMinWidth }} >
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
