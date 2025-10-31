export async function uploadImage(file: File, vendorIdentifier?: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  if (vendorIdentifier) fd.append('vendorSlug', vendorIdentifier);

  const res = await fetch('/api/admin/upload-image', {
    method: 'POST',
    body: fd,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || 'Image upload failed');
  }

  const { url } = await res.json();
  if (!url) throw new Error('Upload did not return a url');
  return url;
}
