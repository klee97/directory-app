import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBlogPublishStatus } from './getBlogPublishStatus';
import { graphQLClient } from '@/lib/contentful/graphqlClient';

vi.mock('@/lib/contentful/graphqlClient', () => ({
  graphQLClient: { request: vi.fn() },
}));

const mockRequest = vi.mocked(graphQLClient.request);

describe('getBlogPublishStatus', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('returns "not-found" when no matching entry exists', async () => {
    mockRequest.mockResolvedValue({ pageBlogPostCollection: { items: [] } });

    const result = await getBlogPublishStatus('nonexistent-slug');

    expect(result).toBe('not-found');
  });

  it('returns "published" when publishedDate is in the past', async () => {
    mockRequest.mockResolvedValue({
      pageBlogPostCollection: { items: [{ publishedDate: '2020-01-01T00:00:00.000Z' }] },
    });

    const result = await getBlogPublishStatus('old-post');

    expect(result).toBe('published');
  });

  it('returns "unpublished" when publishedDate is in the future', async () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
    mockRequest.mockResolvedValue({
      pageBlogPostCollection: { items: [{ publishedDate: future }] },
    });

    const result = await getBlogPublishStatus('future-post');

    expect(result).toBe('unpublished');
  });

  it('passes the slug as a query variable', async () => {
    mockRequest.mockResolvedValue({ pageBlogPostCollection: { items: [] } });

    await getBlogPublishStatus('some-slug');

    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), { slug: 'some-slug' });
  });
});