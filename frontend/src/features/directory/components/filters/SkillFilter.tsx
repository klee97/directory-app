"use client"
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";
import { SKILL_PARAM } from "@/lib/constants";
import { ReadonlyURLSearchParams } from "next/navigation";
import { SKILL_FILTER_NAME, trackFilterEvent } from "@/utils/analytics/trackFilterEvents";

export function SkillFilter({ tags, searchParams }:
    {
        tags: string[];
        searchParams: ReadonlyURLSearchParams;
    }
) {
    const router = useRouter();
    const DEFAULT_ALL_SKILLS = 'Filter: All Skills';

    // Get the selected skill from URL params
    const selectedSkills = useMemo(() => searchParams.getAll(SKILL_PARAM) || [], [searchParams]);

    // Function to update the URL params when selection changes
    const handleChange = useCallback(
        (event: SelectChangeEvent<string[]>) => {
            const newSelectedSkills = event.target.value as string[];

            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete(SKILL_PARAM);
            if (newSelectedSkills.length > 0 && !newSelectedSkills.includes('')) {
                newSelectedSkills.forEach((skill) => {
                    newParams.append(SKILL_PARAM, skill);
                });
            }

            // Use router.push() to update the URL while keeping other params
            router.push(`?${newParams.toString()}`, { scroll: false });
            trackFilterEvent(SKILL_FILTER_NAME, selectedSkills);
        },
        [router, searchParams, selectedSkills]
    );

    return (
        <FormControl sx={{ minWidth: 200 }}>
            <Select
                multiple
                size='small'
                value={selectedSkills}
                onChange={handleChange}
                displayEmpty
                renderValue={(selected) => {
                    if (selected.length === 0) {
                        return <em>{DEFAULT_ALL_SKILLS}</em>;
                    }
                    const joinedString = selected.join(', ');
                    if (joinedString.length > 20) {
                        return `${joinedString.slice(0, 20)}...`;
                    }
                    return joinedString;
                }}>
                <MenuItem value="">
                    <em>{DEFAULT_ALL_SKILLS}</em>
                </MenuItem>
                {tags.map((skill) => (
                    <MenuItem key={skill} value={skill}>
                        {skill}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
