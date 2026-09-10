"use client"
import { SERVICE_PARAM } from "@/lib/constants";
import { SERVICE_FILTER_NAME } from "@/utils/analytics/trackFilterEvents";
import { CheckboxListFilter } from "./CheckboxListFilter";

export function ServiceFilter({ tags, filterMinWidth }: { tags: string[]; filterMinWidth: number }) {
  return (
    <CheckboxListFilter
      title="Services"
      paramKey={SERVICE_PARAM}
      tags={tags}
      filterMinWidth={filterMinWidth}
      analyticsFilterName={SERVICE_FILTER_NAME}
    />
  );
}