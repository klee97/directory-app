/**
 * Converts `[text](url)` markdown links to plain "text" for JSON-LD fields,
 * which expect plain text, not markdown. Keeps the link's visible text,
 * drops the URL and brackets.
 */
export function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}