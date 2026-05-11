import { PageBlogPost } from '@/features/blog/api/getBlogPosts';

export const FILTER_KEY_CATEGORY = 'categoryList' as const;
export const FILTER_KEY_CULTURE = 'cultures' as const;
export const FILTER_KEY_LOCATION = 'locations' as const;

export type FilterKey = typeof FILTER_KEY_CATEGORY | typeof FILTER_KEY_CULTURE | typeof FILTER_KEY_LOCATION;

const GLOBAL_EXCLUDED = ['uncategorized'];
const CULTURE_EXCLUDED = [...GLOBAL_EXCLUDED, 'general'];

function isExcluded(val: string, excluded: string[]): boolean {
  const lower = val.toLowerCase();
  return excluded.some((e) => e === lower);
}

export function formatLabel(val: string): string {
  return val
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getPostLabels(post: PageBlogPost): string[] {
  const labels: string[] = [];
  const seen = new Set<string>();

  const pushUnique = (val: string | null, excluded: string[]) => {
    if (!val || isExcluded(val, excluded)) return;
    const formatted = formatLabel(val);
    if (seen.has(formatted)) return;
    seen.add(formatted);
    labels.push(formatted);
  };

  for (const val of post[FILTER_KEY_CATEGORY] ?? []) {
    pushUnique(val, GLOBAL_EXCLUDED);
  }
  for (const val of post[FILTER_KEY_CULTURE] ?? []) {
    pushUnique(val, CULTURE_EXCLUDED);
  }
  for (const val of post[FILTER_KEY_LOCATION] ?? []) {
    pushUnique(val, GLOBAL_EXCLUDED);
  }
  return labels;
}
