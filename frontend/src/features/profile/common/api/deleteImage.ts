
export async function deleteImage(imageUrl: string, vendorSlug: string): Promise<void> {
  console.debug(`Attempting to delete image from R2: ${imageUrl} for vendor: ${vendorSlug}`);
  const res = await fetch('/api/delete-image', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, vendorSlug }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || 'Image deletion failed');
  }
}