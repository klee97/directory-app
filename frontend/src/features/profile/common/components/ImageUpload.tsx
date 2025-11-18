import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CloudUpload from '@mui/icons-material/CloudUpload';
import Image from 'next/image';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageSelect?: (file: File | null) => void;
  disabled?: boolean;
}

export interface ImageUploadRef {
  reset: () => void;
}

export const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(({
  currentImageUrl,
  onImageSelect,
  disabled = false
}, ref) => {
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expose reset method to parent
  useImperativeHandle(ref, () => ({
    reset: () => {
      console.log("ImageUpload: reset() called");
      setPreviewUrl(null);
      setSelectedFile(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }));

  
  useEffect(() => {
    console.log("Current image URL changed:", currentImageUrl);
    if (!currentImageUrl) {
      setPreviewUrl(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setPreviewUrl(currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      setError('Image must be less than 3MB');
      return;
    }

    setError(null);

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
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(currentImageUrl || null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageSelect) {
      onImageSelect(null);
    }
  };

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Cover Image
      </Typography>

      {previewUrl && (
        <Box
          sx={{
            mb: 2,
            maxWidth: 400,
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
            {selectedFile ? 'Change Image' : 'Select Image'}
          </Button>
        </label>

        {selectedFile && (
          <Button
            variant="text"
            color="error"
            onClick={handleClear}
          >
            Clear
          </Button>
        )}
      </Box>

      {selectedFile && (
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main' }}>
          ✓ Image selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)}KB)
          <br />
          Will be uploaded when you click &quot;Update Vendor&quot;
        </Typography>
      )}

      {disabled && (
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'warning.main' }}>
          ⚠️ Please enter the vendor slug first
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
        Recommended: 800px wide or larger. Max file size: 3MB. Image will be automatically resized and optimized.
      </Typography>
    </Box>
  );
});

ImageUpload.displayName = 'ImageUpload'; // For better debugging in React DevTools