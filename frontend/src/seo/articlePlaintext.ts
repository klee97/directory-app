import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';
import { Document } from '@contentful/rich-text-types';

const DEFAULT_MAX_LENGTH = 500;

/**
 * Converts a Contentful rich-text document into a plain-text summary,
 * truncated to a specified maximum length. It also collapses multiple whitespace characters into a single space.
 */
export function richTextToPlainText(
  doc: Document | null | undefined,
  maxLength: number = DEFAULT_MAX_LENGTH
): string {
  if (!doc) return '';

  const text = documentToPlainTextString(doc).trim().replace(/\s+/g, ' ');
  return text.slice(0, maxLength);
}