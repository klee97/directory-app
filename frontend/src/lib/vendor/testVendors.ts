import { shouldIncludeTestVendors } from "../env/env";

export function filterTestVendors<T extends { id: string }>(data: T[]): T[] {
  return shouldIncludeTestVendors()
    ? data
    : data.filter((v) => !v.id.startsWith("TEST-"));
}
