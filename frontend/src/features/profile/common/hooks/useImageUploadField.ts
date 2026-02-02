import { useRef, useState } from 'react';
import { useImageUploader } from '@/features/profile/common/hooks/useImageUploader';
import type { ImageUploadRef } from '@/features/profile/common/components/ImageUpload';

export const useImageUploadField = () => {
  const imageUploadRef = useRef<ImageUploadRef>(null);
  const [file, setFile] = useState<File | null>(null);
  const { upload, loading } = useImageUploader();

  const handleSelect = (file: File | null) => {
    setFile(file);
  };

  const uploadIfPresent = async (identifier: string) => {
    if (!file || !identifier) return null;
    return upload(file, identifier);
  };

  const reset = () => {
    setFile(null);
    imageUploadRef.current?.reset();
  };

  return {
    imageUploadRef,
    file,
    loading,
    onSelect: handleSelect,
    uploadIfPresent,
    reset,
  };
};
