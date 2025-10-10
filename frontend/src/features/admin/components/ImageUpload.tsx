import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CloudUpload from '@mui/icons-material/CloudUpload';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Image from 'next/image';

interface ImageUploadProps {
  vendorSlug: string;
  currentImageUrl?: string;
  onUploadSuccess?: (newUrl: string) => void;
  disabled?: boolean;
}

export function ImageUpload({
  vendorSlug,
  currentImageUrl,
  onUploadSuccess,
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    setSuccess(false);
    setUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vendorSlug', vendorSlug);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      setPreviewUrl(data.url);

      if (onUploadSuccess) {
        onUploadSuccess(data.url);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      // Restore previous preview on error
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
          }}
        >
          <Image
            src={previewUrl}
            alt="Image preview"
            fill
            style={{ objectFit: 'cover' }}  // Maintains aspect ratio
            sizes="(max-width: 768px) 100vw, 400px"  // Responsive sizing
            priority
          />
        </Box>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        id="image-upload"
      />

      <label htmlFor="image-upload">
        <Button
          variant="outlined"
          component="span"
          disabled={disabled || uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </Button>
      </label>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 2 }}>
          Cover image updated successfully!
        </Alert>
      )}

      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
        Recommended: 800px wide or larger. Max file size: 10MB. Image will be automatically resized and optimized.
      </Typography>
    </Box>
  );
}