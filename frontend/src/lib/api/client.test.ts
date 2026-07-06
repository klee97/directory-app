import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { callApi } from './client';

describe('callApi', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('returns the successful ApiResponse payload when the route responds with ok/data', async () => {
    fetchMock.mockResolvedValue({
      json: vi.fn().mockResolvedValue({ ok: true, data: { id: '123' } }),
    });

    await expect(callApi('/api/test')).resolves.toEqual({ ok: true, data: { id: '123' } });
  });

  it('returns the error ApiResponse payload when the route responds with ok/false', async () => {
    fetchMock.mockResolvedValue({
      json: vi.fn().mockResolvedValue({ ok: false, error: 'Validation failed', code: 'INVALID' }),
    });

    await expect(callApi('/api/test')).resolves.toEqual({
      ok: false,
      error: 'Validation failed',
      code: 'INVALID',
    });
  });

  it('returns a network error response when fetch rejects', async () => {
    fetchMock.mockRejectedValue(new Error('boom'));

    await expect(callApi('/api/test')).resolves.toEqual({
      ok: false,
      error: 'Network error. Please try again.',
    });
  });
});
