import { VendorTag } from "@/types/vendor";

export function getSelectedServiceLabels(
  selectedIds: string[],
  serviceOptions: VendorTag[]
): string[] {
  return selectedIds
    .map((id) => serviceOptions.find((opt) => opt.id === id)?.display_name)
    .filter((label): label is string => Boolean(label));
}
