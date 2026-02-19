import { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CloudUpload from '@mui/icons-material/CloudUpload';
import Image from 'next/image';

const MAX_FILE_SIZE_MB = 10;

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageSelect?: (file: File | null) => void;
  onError: (error: string | null) => void;
  disabled?: boolean;
  admin?: boolean;
}

export interface ImageUploadRef {
  reset: () => void;
}

export const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(({
  currentImageUrl,
  onImageSelect,
  onError,
  disabled = false,
  admin = false,
}, ref) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expose reset method to parent
  useImperativeHandle(ref, () => ({
    reset: () => {
      console.debug("ImageUpload: reset() called");
      setPreviewUrl(null);
      setSelectedFile(null);
      onError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }));


  useEffect(() => {
    console.debug("Current image URL changed:", currentImageUrl);
    if (currentImageUrl) {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    console.debug("Image file selected:", event.target.files);
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      onError?.(`Image must be less than ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    onError?.(null);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Store file and notify parent
    setSelectedFile(file);
    if (onImageSelect) {
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageSelect) {
      onImageSelect(null);
    }
  };

  return (
    <Box sx={{ my: 3 }}>

      {previewUrl && (
        <Box
          sx={{
            mb: 2,
            maxWidth: 200,
            borderRadius: 1,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            position: 'relative',
            aspectRatio: '3 / 4',
          }}
        >
          <Image
            src={previewUrl}
            alt="Cover preview"
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 400px"
            priority
          />
        </Box>
      )}

      {admin && selectedFile && (
        <Typography variant="caption" display="block" sx={{ mb: 1, color: 'success.main' }}>
          File size: {(selectedFile.size / (1024 * 1024)).toFixed(2)}MB
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="cover-image-upload"
          disabled={disabled}
        />

        <label htmlFor="cover-image-upload">
          <Button
            variant="outlined"
            component="span"
            disabled={disabled}
            startIcon={<CloudUpload />}
          >
            {previewUrl ? 'Change Image' : 'Select Image'}
          </Button>
        </label>

        {previewUrl && (
          <Button
            variant="text"
            color="error"
            onClick={handleClear}
          >
            Clear
          </Button>
        )}
      </Box>


      {admin && disabled && (
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'warning.main' }}>
          ⚠️ Please enter the vendor slug first
        </Typography>
      )}

      {admin &&
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
          Max file size: {MAX_FILE_SIZE_MB}MB
        </Typography>
      }
    </Box>
  );
});

ImageUpload.displayName = 'ImageUpload'; // For better debugging in React DevTools