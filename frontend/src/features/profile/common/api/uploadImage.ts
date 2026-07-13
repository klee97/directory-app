import { fetchApi } from '@/lib/api/client';

interface UploadImageResponse {
  url: string;
  originalSize: number;
  processedSize: number;
}

export async function uploadImage(file: File, vendorIdentifier?: string): Promise<string | null> {
  const fd = new FormData();
  fd.append('file', file);
  if (vendorIdentifier) fd.append('vendorSlug', vendorIdentifier);

  const result = await fetchApi<UploadImageResponse>('/api/upload-image', {
    method: 'POST',
    body: fd,
  });

  if (!result.ok) {
    console.error('Failed to upload image:', result.error);
    return null;
  }

  const { url } = result.data;
  return url || null;
}
