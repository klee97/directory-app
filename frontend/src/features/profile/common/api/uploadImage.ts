import { callApi } from '@/lib/api/client';

interface UploadImageResponse {
  success: true;
  url: string;
  originalSize: number;
  processedSize: number;
}

export async function uploadImage(file: File, vendorIdentifier?: string): Promise<string | null> {
  const fd = new FormData();
  fd.append('file', file);
  if (vendorIdentifier) fd.append('vendorSlug', vendorIdentifier);

  const result = await callApi<UploadImageResponse>('/api/upload-image', {
    method: 'POST',
    body: fd,
  });

  if (!result.ok) {
    return null;
  }

  const { url } = result.data;
  return url || null;
}
