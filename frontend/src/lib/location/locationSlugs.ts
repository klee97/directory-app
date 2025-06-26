import { supabase } from "../api-client";

let cachedSlugs: Set<string> | null = null;

export async function getValidLocationSlugs(): Promise<Set<string>> {
  if (cachedSlugs) return cachedSlugs;
  const { data, error } = await supabase
    .from('location_slugs')
    .select('slug');

  if (error) {
    console.error('Error fetching location slugs:', error);
    return new Set();
  }

  cachedSlugs = new Set(data.map((item) => item.slug));
  return cachedSlugs;
}

export async function prewarmLocationSlugCache() {
  if (!cachedSlugs) await getValidLocationSlugs();
}

export function slugifyParts(...parts: (string | null | undefined)[]): string {
  return parts
    .filter((part): part is string => !!part) // Remove null/undefined/empty
    .map((part) =>
      part
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
        .replace(/^-+|-+$/g, '')     // Trim dashes at start/end
    )
    .join('-');
}

/**
 * Generate slugs from address for breadcrumb navigation.
 */
export async function generateBreadcrumbSlugs(
    { city,
      state,
      country
    }: {
      city: string | null,
      state: string | null,
      country: string | null
    }
  ): Promise<{ label: string, href: string }[]> {
  const crumbs = [];

  if (country) {
    const slug = slugifyParts(country);
    const slugExists = await checkSlugExists(slug);
    if (slugExists) {
      crumbs.push({
        label: country,
        href: `/${slug}`,
      });
    }
  }

  if (state && country) {
    const slug = slugifyParts(state, country);
    const slugExists = await checkSlugExists(slug);
    if (slugExists) {
      crumbs.push({
        label: state,
        href: `/${slug}`,
      });
    }
  }

  if (city) {
    const slug = slugifyParts(city, state, country);
    const slugExists = await checkSlugExists(slug);
    if (slugExists) {
      crumbs.push({
        label: city,
        href: `/${slug}`,
      });
    }
  }
  return crumbs;
}

export async function checkSlugExists(slug: string): Promise<boolean> {
  if (!slug) return false; // If slug is empty, return false immediately
  const slugs = await getValidLocationSlugs();
  return slugs.has(slug);
}