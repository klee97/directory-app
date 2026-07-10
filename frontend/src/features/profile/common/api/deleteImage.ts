import { fetchApi } from '@/lib/api/client';

interface DeleteImageResponse {
  success: true;
}

export async function deleteImage(imageUrl: string, vendorSlug: string): Promise<boolean> {
  console.debug(`Attempting to delete image from R2: ${imageUrl} for vendor: ${vendorSlug}`);
  const result = await fetchApi<DeleteImageResponse>('/api/delete-image', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, vendorSlug }),
  });

  return result.ok;
}