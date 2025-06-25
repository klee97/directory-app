import { CITY_ABBREVIATIONS, COUNTRY_ABBREVIATIONS, LOCATION_TYPE_COUNTRY, LOCATION_TYPE_STATE, STATE_ABBREVIATIONS } from "@/types/location";
import { supabase } from "../api-client";

export function getDisplayName(
  city: string | null,
  state: string | null,
  country: string | null,
  type: string
): string {
  const countryName = country ? COUNTRY_ABBREVIATIONS[country] || country : "";
  const stateName = state ? STATE_ABBREVIATIONS[state] || state : "";
  const cityName = city ? CITY_ABBREVIATIONS[city] || city : "";
  if (type === LOCATION_TYPE_COUNTRY) {
    return countryName;
  } else if (type === LOCATION_TYPE_STATE) {
    return [state || cityName, countryName].filter(Boolean).join(", ");
  } else {
    return [cityName, stateName, countryName].filter(Boolean).join(", ");
  }
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
  const { data, error } = await supabase
    .from('location_slugs')
    .select('slug')
    .eq('slug', slug)
    .single(); // Expect only one row

  if (error) {
    // If the error is because no record exists, that's fine
    if (error.code === 'PGRST116') return false;
    console.error('Error checking slug:', error);
    return false;
  }
  return !!data;
}