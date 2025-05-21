"use client"
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";
import { LOCATION_PARAM } from "@/lib/constants";
import { ReadonlyURLSearchParams } from "next/navigation";

export function LocationFilter({ uniqueRegions, searchParams }:
  {
    uniqueRegions: string[];
    searchParams: ReadonlyURLSearchParams;
  }
) {
  const router = useRouter();

  // Get the selected region from URL params
  const selectedRegion = searchParams.get(LOCATION_PARAM) || '';

  // Function to update the URL params when selection changes
  const handleChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const region = event.target.value as string;
  
      const newParams = new URLSearchParams(searchParams.toString());
  
      if (region) {
        newParams.set(LOCATION_PARAM, region);
      } else {
        newParams.delete(LOCATION_PARAM);
      }
  
      // Use router.push() to update the URL while keeping other params
      router.push(`?${newParams.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );
  
  return (
    <FormControl sx={{ minWidth: 200 }}>
      <Select size='small' value={selectedRegion} onChange={handleChange} displayEmpty>
        <MenuItem value="">
          <em>Filter: All Regions</em>
        </MenuItem>
        {uniqueRegions.map((region) => (
          <MenuItem key={region} value={region}>
            {region}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
