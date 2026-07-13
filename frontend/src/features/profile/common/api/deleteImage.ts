import { fetchApi } from '@/lib/api/client';
import { EmptyResponse } from '@/types/api';

export async function deleteImage(imageUrl: string, vendorSlug: string): Promise<boolean> {
  console.debug(`Attempting to delete image from R2: ${imageUrl} for vendor: ${vendorSlug}`);
  const result = await fetchApi<EmptyResponse>('/api/delete-image', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, vendorSlug }),
  });

  if (!result.ok) {
    console.error('Failed to delete image from R2:', result.error);
    return false;
  }

  return true;
}