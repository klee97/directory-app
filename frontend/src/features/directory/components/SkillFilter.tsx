"use client"
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";
import { SKILL_PARAM } from "@/lib/constants";
import { ReadonlyURLSearchParams } from "next/navigation";
export function SkillFilter({ tags, searchParams }:
    {
        tags: string[];
        searchParams: ReadonlyURLSearchParams;
    }
) {
    const router = useRouter();

    // Get the selected skill from URL params
    const selectedRegion = searchParams.get(SKILL_PARAM) || '';

    // Function to update the URL params when selection changes
    const handleChange = useCallback(
        (event: SelectChangeEvent<string>) => {
            const skill = event.target.value as string;

            const newParams = new URLSearchParams(searchParams.toString());

            if (skill) {
                newParams.set(SKILL_PARAM, skill);
            } else {
                newParams.delete(SKILL_PARAM);
            }

            // 🔹 Use router.push() to update the URL while keeping other params
            router.push(`?${newParams.toString()}`, { scroll: false });
        },
        [router, searchParams]
    );

    return (
        <FormControl sx={{ minWidth: 200 }}>
            <Select size='small' value={selectedRegion} onChange={handleChange} displayEmpty>
                <MenuItem value="">
                    <em>Filter: All Skills</em>
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
