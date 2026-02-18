
export async function deleteImage(imageUrl: string, vendorSlug: string): Promise<void> {
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