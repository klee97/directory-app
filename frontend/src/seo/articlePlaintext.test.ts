import { describe, it, expect } from 'vitest';
import { richTextToPlainText } from './articlePlaintext';
import { BLOCKS, Document, Text, TopLevelBlock, Paragraph } from '@contentful/rich-text-types';

function makeTextNode(value: string): Text {
  return {
    nodeType: 'text',
    value,
    marks: [],
    data: {},
  };
}

function makeDoc(text: string): Document {
  const paragraph: Paragraph = {
    nodeType: BLOCKS.PARAGRAPH,
    data: {},
    content: [makeTextNode(text)],
  };

  return {
    nodeType: BLOCKS.DOCUMENT,
    data: {},
    content: [paragraph as TopLevelBlock],
  };
}

describe('richTextToPlainText', () => {
  it('returns empty string for null/undefined input', () => {
    expect(richTextToPlainText(null)).toBe('');
    expect(richTextToPlainText(undefined)).toBe('');
  });

  it('extracts plain text from a simple document', () => {
    expect(richTextToPlainText(makeDoc('Hello world'))).toBe('Hello world');
  });

  it('truncates to maxLength', () => {
    const longText = 'a'.repeat(1000);
    expect(richTextToPlainText(makeDoc(longText), 50)).toHaveLength(50);
  });

  it('collapses extra whitespace', () => {
    expect(richTextToPlainText(makeDoc('  Hello   world  '))).toBe('Hello world');
  });
});