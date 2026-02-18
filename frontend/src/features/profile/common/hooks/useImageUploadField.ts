import { useRef, useState } from 'react';
import { useImageUploader } from '@/features/profile/common/hooks/useImageUploader';
import type { ImageUploadRef } from '@/features/profile/common/components/ImageUpload';
import { VendorMediaBase, VendorMediaForm } from "@/types/vendorMedia";

export const useImageUploadField = () => {
  const imageUploadRef = useRef<ImageUploadRef>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const { upload, deleteExisting, loading } = useImageUploader();

  const handleSelect = (
    file: File | null,
    previousBlobUrlRef: React.RefObject<string | null>,
    updateFormData: (url: string | null, options?: { preserveMetadata?: boolean }) => void
  ) => {
    // Clean up previous blob URL to prevent memory leak
    if (previousBlobUrlRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previousBlobUrlRef.current);
    }

    setFile(file);
    setImageChanged(true); // Track that the image has changed

    if (file) {
      // New file selected - show preview
      const previewUrl = URL.createObjectURL(file);
      previousBlobUrlRef.current = previewUrl;
      updateFormData(previewUrl, { preserveMetadata: true });
    } else {
      // File cleared
      previousBlobUrlRef.current = null;
      updateFormData(null);
    }
  };

  /**
   * Returns:
   *   undefined  — image unchanged, caller should keep existing cover_image as-is
   *   null       — image was cleared, caller should set cover_image to null
   *   string     — new R2 URL, caller should update cover_image.media_url
   */
  const uploadIfChanged = async (
    vendorSlug: string,
    currentMedia: VendorMediaForm | null,
  ): Promise<string | null | undefined> => {
    if (!imageChanged) return undefined;

    const existingUrl = currentMedia?.media_url;
    const hasStoredImage = existingUrl && !existingUrl.startsWith('blob:');

    // New file selected — upload it, clean up old one
    if (file) {
      let uploadedUrl: string;
      try {
        uploadedUrl = await upload(file, vendorSlug);
      } catch (err) {
        throw new Error('Failed to upload image. Please try again.');
      }
      if (hasStoredImage) {
        try {
          await deleteExisting(existingUrl, vendorSlug);
        } catch (err) {
          console.error('Failed to delete old image after upload:', err);
          // Non-fatal
        }
      }

      return uploadedUrl;
    }

    // Cleared — delete from R2 if there was a stored image
    if (hasStoredImage) {
      try {
        await deleteExisting(existingUrl, vendorSlug);
      } catch (err) {
        console.error('Failed to delete image from storage:', err);
        // Non-fatal
      }
    }

    return null;
  };

  // Helper for updating VendorMedia URL
  const updateMediaUrl = <T extends { cover_image?: VendorMediaForm | null }>(
    prev: T,
    url: string | null,
    vendorId: string,
    options?: { preserveMetadata?: boolean }
  ): T => {
    if (url === null) {
      return { ...prev, cover_image: null };
    }

    if (options?.preserveMetadata && prev.cover_image) {
      // Preserve id and other metadata — important for the update path
      return {
        ...prev,
        cover_image: {
          ...prev.cover_image,
          media_url: url,
          is_featured: true,
          vendor_id: vendorId,
        } satisfies VendorMediaForm,
      };
    }

    // Fresh cover image, no existing row yet
    return {
      ...prev,
      cover_image: {
        media_url: url,
        is_featured: true,
        credits: null,
        consent_given: false,
        vendor_id: vendorId,
      } satisfies VendorMediaForm,
    };
  };


  // Helper for updating VendorMedia metadata
  const updateMediaMetadata = <T extends { cover_image?: VendorMediaForm | null }>(
    prev: T,
    updates: Partial<VendorMediaBase>
  ): T => ({
    ...prev,
    cover_image: {
      ...prev.cover_image,
      ...updates,
    } as VendorMediaForm,
  });

  const reset = () => {
    setFile(null);
    setImageChanged(true); // Track that the image has changed
    imageUploadRef.current?.reset();
  };

  return {
    imageUploadRef,
    file,
    loading,
    handleSelect,
    uploadIfChanged,
    reset,
    updateMediaUrl,
    updateMediaMetadata,
  };
};
