import { PageBlogPost } from '@/features/blog/api/getBlogPosts';

function isExcluded(val: string, excluded: string[]): boolean {
  const lower = val.toLowerCase();
  return excluded.some((e) => e === lower);
}

const GLOBAL_EXCLUDED = ['uncategorized'];
const CULTURE_EXCLUDED = [...GLOBAL_EXCLUDED, 'general'];

export function formatLabel(val: string): string {
  return val
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getPostLabels(post: PageBlogPost): string[] {
  const labels: string[] = [];
  for (const val of post.categoryList ?? []) {
    if (val && !isExcluded(val, GLOBAL_EXCLUDED)) labels.push(formatLabel(val));
  }
  for (const val of post.cultures ?? []) {
    if (val && !isExcluded(val, CULTURE_EXCLUDED)) labels.push(formatLabel(val));
  }
  for (const val of post.locations ?? []) {
    if (val && !isExcluded(val, GLOBAL_EXCLUDED)) labels.push(formatLabel(val));
  }
  return labels;
}
