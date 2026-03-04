"use client";
import { VendorFormData } from "@/types/vendorFormData";
import { useMemo } from "react";
import { Section } from "../components/Section";

export function useSectionCompletion(
  sections: Section[],
  formData: VendorFormData
) {
  const { completedSections, inProgressSections } = useMemo(() => {
    const completed: string[] = [];
    const inProgress: string[] = [];

    for (const section of sections) {
      const { isValid, isComplete, isEmpty } = section.validate(formData);

      if (isComplete && isValid) {
        completed.push(section.id);
      } else if (!isEmpty) {
        inProgress.push(section.id);
      }
    }

    return { completedSections: completed, inProgressSections: inProgress };
  }, [sections, formData]);

  return { completedSections, inProgressSections };
}