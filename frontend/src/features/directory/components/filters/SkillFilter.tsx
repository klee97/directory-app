"use client"
import { SKILL_PARAM } from "@/lib/constants";
import { SKILL_FILTER_NAME } from "@/utils/analytics/trackFilterEvents";
import { CheckboxListFilter } from "./CheckboxListFilter";

export function SkillFilter({ tags, filterMinWidth }: { tags: string[]; filterMinWidth: number }) {
  return (
    <CheckboxListFilter
      title="Skills"
      paramKey={SKILL_PARAM}
      tags={tags}
      filterMinWidth={filterMinWidth}
      analyticsFilterName={SKILL_FILTER_NAME}
    />
  );
}