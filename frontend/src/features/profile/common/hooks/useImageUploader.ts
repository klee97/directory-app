import { useState, useCallback } from 'react';
import { uploadImage } from '../api/uploadImage';
import { useNotification } from '@/contexts/NotificationContext';

export function useImageUploader() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();

  const upload = useCallback(async (file: File, vendorIdentifier?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = await uploadImage(file, vendorIdentifier);
      console.debug("Image uploaded successfully, URL:", url);
      addNotification('Image uploaded', 'success');
      const publicUrl = `${process.env.R2_TEST_URL}/${file.name}`;
      return publicUrl;
    } catch (err) {
      const message = (err instanceof Error) ? err.message : 'Upload failed';
      setError(message);
      addNotification(message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  return { upload, loading, error };
}
