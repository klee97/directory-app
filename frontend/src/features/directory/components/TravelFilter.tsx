"use client";

import { useRouter, usePathname, ReadonlyURLSearchParams } from "next/navigation";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { TRAVEL_PARAM } from "@/lib/constants";

export default function TravelFilter({ searchParams }: { searchParams: ReadonlyURLSearchParams }) {
  const router = useRouter();
  const pathname = usePathname();

  // Get the current value from URL (default to false if not set)
  const travelsWorldwide = searchParams.get(TRAVEL_PARAM)?.toLowerCase() === "true";

  // Function to update the URL param
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTravelsWorldwide = event.target.checked;
    const params = new URLSearchParams(searchParams);

    if (newTravelsWorldwide) {
      params.set(TRAVEL_PARAM, "true");
    } else {
      params.delete(TRAVEL_PARAM); // Remove param if false
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <FormControlLabel
      control={
        <Switch checked={travelsWorldwide} onChange={handleToggle} color="primary" />
      }
      label="Travels Worldwide"
    />
  );
}
