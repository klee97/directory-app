import { useState, useCallback } from 'react';
import { uploadImage } from '../api/uploadImage';
import { deleteImage } from '../api/deleteImage';

export function useImageUploader() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File, vendorIdentifier?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = await uploadImage(file, vendorIdentifier);
      return url;
    } catch (err) {
      const message = (err instanceof Error) ? err.message : 'Upload failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExisting = useCallback(async (imageUrl: string, vendorSlug: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteImage(imageUrl, vendorSlug);
      console.debug("Image deleted successfully from R2");
    } catch (err) {
      const message = (err instanceof Error) ? err.message : 'Delete failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { upload, deleteExisting, loading, error };
}