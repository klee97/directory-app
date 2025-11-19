import { shouldIncludeTestVendors } from "../env/env";

const prefixes: string[] = [];

// add supabase storage url (deprecated)
if (process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL) {
  prefixes.push(process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL);
}

// add cloudflare r2 url
if (process.env.NEXT_PUBLIC_R2_PUBLIC_URL) {
  prefixes.push(process.env.NEXT_PUBLIC_R2_PUBLIC_URL);
}

if (shouldIncludeTestVendors() && process.env.R2_TEST_URL) {
  prefixes.push(process.env.R2_TEST_URL);
}

export const PREFIXES: Set<string> = new Set(prefixes);

export const isAllowedPrefix = (url: string) => {
  const normalizedUrl = url.trim().toLowerCase();
  const matchedPrefix = [...PREFIXES].find(prefix => {
    const doesMatch = normalizedUrl.startsWith(prefix);
    return doesMatch;
  });

  if (!matchedPrefix) {
    console.warn(`[prefix-check] No prefixes matched for URL: ${normalizedUrl}`);
    return false;
  }

  return true;
};