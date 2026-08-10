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