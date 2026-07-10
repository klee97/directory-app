import { beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchApiMock } = vi.hoisted(() => ({
  fetchApiMock: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
  fetchApi: fetchApiMock,
}));

import { deleteImage } from './deleteImage';
import { uploadImage } from './uploadImage';

describe('image API helpers', () => {
  beforeEach(() => {
    fetchApiMock.mockReset();
  });

  it('returns the uploaded URL when uploadImage gets a successful response', async () => {
    fetchApiMock.mockResolvedValue({ ok: true, data: { success: true, url: 'https://cdn.example.com/image.jpg', originalSize: 100, processedSize: 80 } });

    await expect(uploadImage(new File(['test'], 'test.jpg'))).resolves.toBe('https://cdn.example.com/image.jpg');
  });

  it('returns null when uploadImage gets an error response', async () => {
    fetchApiMock.mockResolvedValue({ ok: false, error: 'Upload failed' });

    await expect(uploadImage(new File(['test'], 'test.jpg'))).resolves.toBeNull();
  });

  it('returns true when deleteImage gets a successful response', async () => {
    fetchApiMock.mockResolvedValue({ ok: true, data: { success: true } });

    await expect(deleteImage('https://example.com/image.jpg', 'vendor-slug')).resolves.toBe(true);
  });

  it('returns false when deleteImage gets an error response', async () => {
    fetchApiMock.mockResolvedValue({ ok: false, error: 'Delete failed' });

    await expect(deleteImage('https://example.com/image.jpg', 'vendor-slug')).resolves.toBe(false);
  });
});
