/**
 * Maps raw URL param values to their canonical casing from a known-valid
 * list, matching case-insensitively. Values with no match (typos, stale
 * tags, or someone hand-editing the URL) are dropped. Also dedupes, so
 * `?service=Makeup&service=makeup` collapses to one value.
 */
export function sanitizeFilterValues(rawValues: string[], validValues: string[]): string[] {
  const canonicalByLower = new Map(validValues.map(v => [v.toLowerCase(), v]));
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of rawValues) {
    const canonical = canonicalByLower.get(raw.trim().toLowerCase());
    if (canonical && !seen.has(canonical)) {
      seen.add(canonical);
      result.push(canonical);
    }
  }

  return result;
}