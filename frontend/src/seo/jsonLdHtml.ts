

export const SITE_URL = "https://www.asianweddingmakeup.com";

export const ORG_ID = SITE_URL + "#organization";
export const WEBSITE_ID = SITE_URL + "#website";

export function toAbsoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}
export function sanitizeJsonLdHtml(jsonLd: unknown): string {
  return JSON.stringify(jsonLd)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function jsonLdGraph(nodes: readonly unknown[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}