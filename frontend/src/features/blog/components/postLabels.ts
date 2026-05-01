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
  for (const val of post[FILTER_KEY_CATEGORY] ?? []) {
    if (val && !isExcluded(val, GLOBAL_EXCLUDED)) labels.push(formatLabel(val));
  }
  for (const val of post[FILTER_KEY_CULTURE] ?? []) {
    if (val && !isExcluded(val, CULTURE_EXCLUDED)) labels.push(formatLabel(val));
  }
  for (const val of post[FILTER_KEY_LOCATION] ?? []) {
    if (val && !isExcluded(val, GLOBAL_EXCLUDED)) labels.push(formatLabel(val));
  }
  return labels;
}
