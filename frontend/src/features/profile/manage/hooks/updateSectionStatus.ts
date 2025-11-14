"use client";
import { VendorFormData } from "@/types/vendorFormData";
import { useEffect, useState } from "react";
import { Section } from "../components/Section";

export function useSectionCompletion(
  sections: Section[],
  formData: VendorFormData
) {
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [inProgressSections, setInProgressSections] = useState<string[]>([]);

  useEffect(() => {
    const completed: string[] = [];
    const inProgress: string[] = [];

    for (const section of sections) {
      const { isValid, isComplete, errors } = section.validate(formData);

      if (isComplete && isValid) {
        completed.push(section.id);
      } else if (Object.values(errors).some(Boolean) || !isComplete) {
        inProgress.push(section.id);
      }
    }

    setCompletedSections(completed);
    setInProgressSections(inProgress);
  }, [sections, formData]);

  return { completedSections, inProgressSections };
}