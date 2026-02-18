'use client';

import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import { updateVendor } from '@/features/profile/common/api/updateVendor';
import { useNotification } from '@/contexts/NotificationContext';
import RegionSelector, { RegionOption } from '@/features/profile/common/components/RegionSelector';
import TagSelector from '@/features/profile/common/components/TagSelector';
import { useTags } from '@/features/profile/common/hooks/useTags';
import Link from 'next/link';
import { ImageUpload } from '../../common/components/ImageUpload';
import { VendorTag } from '@/types/vendor';
import { VendorDataInput } from '../util/vendorHelper';
import { normalizeUrl } from '@/lib/profile/normalizeUrl';
import { normalizeInstagramHandle } from '@/lib/profile/normalizeInstagram';
import InputAdornment from '@mui/material/InputAdornment';
import { useImageUploadField } from '../../common/hooks/useImageUploadField';
import { VendorFormDataAdmin } from '@/types/vendorFormData';
import { VendorMediaDraft, VendorMediaForm } from "@/types/vendorMedia";

import { formDataToVendor } from '@/lib/profile/formToVendorTranslator';
import Checkbox from '@mui/material/Checkbox';

export const UPDATE_VENDOR_INPUT_DEFAULT: VendorFormDataAdmin = {
  "bridal_hair_&_makeup_price": null,
  bridal_hair_price: null,
  bridal_makeup_price: null,
  "bridesmaid_hair_&_makeup_price": null,
  bridesmaid_hair_price: null,
  bridesmaid_makeup_price: null,
  business_name: null,
  cover_image: null,
  description: null,
  email: null,
  google_maps_place: null,
  instagram: null,
  latitude: null,
  lists_prices: null,
  longitude: null,
  region: null,
  tags: null,
  travels_world_wide: null,
  website: null,
} as const;

export const AdminUpdateVendorManagement = () => {
  const { addNotification } = useNotification();
  const [newFormData, setFormData] = useState<VendorFormDataAdmin>(UPDATE_VENDOR_INPUT_DEFAULT);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionOption | null>(null);
  const [selectedTags, setSelectedTags] = useState<VendorTag[] | null>(null);
  const { tags } = useTags();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previousBlobUrlRef = useRef<string | null>(null);

  // Separate state for lookup fields (immutable identifiers)
  const [lookupId, setLookupId] = useState<string>('');
  const [lookupSlug, setLookupSlug] = useState<string>('');

  const image = useImageUploadField();

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (previousBlobUrlRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(previousBlobUrlRef.current);
      }
    };
  }, []);

  // Helper function to handle text field changes - prevents empty strings
  const handleTextFieldChange = (value: string, field: keyof VendorDataInput) => {
    const trimmedValue = value.trim();
    setFormData({
      ...newFormData,
      [field]: trimmedValue === '' ? null : value // Store new value if not empty after trim
    });
  };

  // Helper function to handle number field changes
  const handleNumberFieldChange = (value: string, field: keyof VendorDataInput) => {
    const trimmedValue = value.trim();
    const numberValue = trimmedValue === '' ? null : Number(trimmedValue);
    setFormData({
      ...newFormData,
      [field]: numberValue
    });
  };

  const updateExistingVendor = async () => {
    setIsSubmitting(true);

    try {
      const vendorId = lookupId.trim();
      if (!vendorId) {
        addNotification("Vendor ID is required.", "error");
        setIsSubmitting(false);
        return;
      }
      const slug = lookupSlug.trim();
      if (!slug) {
        addNotification("Vendor slug is required.", "error");
        setIsSubmitting(false);
        return;
      }
      // Check if there are any changes to update
      const hasVendorChanges = Object.values(newFormData).some(value => value !== null);

      if (!hasVendorChanges && !image.file) {
        addNotification("No changes to update.", "warning");
        return;
      }

      // Upload image first if selected and delete old one if needed
      const uploadedUrl = await image.uploadIfChanged(slug, newFormData.cover_image ?? null);

      let coverImage: VendorMediaForm | null;

      if (uploadedUrl === undefined) {
        // Image unchanged — keep as-is
        coverImage = newFormData.cover_image ?? null;
      } else if (uploadedUrl === null) {
        // Image cleared
        coverImage = null;
      } else if (newFormData.cover_image) {
        // New upload, existing draft media — preserve id and metadata
        coverImage = { ...newFormData.cover_image, media_url: uploadedUrl, vendor_id: vendorId };
      } else {
        // New upload, no prior media object — build a fresh draft
        coverImage = {
          media_url: uploadedUrl,
          vendor_id: vendorId,
          is_featured: true,
          consent_given: false,
          credits: null,
        } satisfies VendorMediaDraft;
      }
      // Prepare vendor data with uploaded image

      const newVendorData = formDataToVendor(newFormData, coverImage?.media_url ?? null);
      const images: VendorMediaForm[] = coverImage ? [coverImage] : [];

      // Update vendor if there are any changes
      if (hasVendorChanges || coverImage) {
        const data = await updateVendor(
          {id: vendorId},
          newVendorData,
          firstName,
          lastName,
          selectedTags,
          images
        );

        if (data) {
          addNotification("Vendor updated successfully!");
          // Reset all form fields
          setFormData(UPDATE_VENDOR_INPUT_DEFAULT);
          setFirstName(null);
          setLastName(null);
          setSelectedRegion(null);
          setSelectedTags(null);
          setLookupId('');
          setLookupSlug('');
          image.reset();
        } else {
          addNotification("Failed to update vendor. Please try again.", "error");
        }
      }
    } catch (error) {
      addNotification(
        error instanceof Error
          ? `Error: ${error.message}`
          : "An unexpected error occurred. Please try again.",
        "error"
      );
      console.error("Error updating vendor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof VendorDataInput) => {
    const value = e.target.value.trim();
    const numberValue = value === '' ? null : Number(value);
    setFormData({ ...newFormData, [field]: numberValue, lists_prices: numberValue !== null });
  };

  const handleRegionChange = (value: RegionOption | null) => {
    setSelectedRegion(value);
    setFormData({ ...newFormData, region: value?.unique_region ?? value?.inputValue ?? null });
  };

  const handleTagChange = (value: VendorTag[] | null) => {
    setSelectedTags(value);
    setFormData({ ...newFormData, tags: value });
  }

  const parseBooleanString = (value: string): boolean | null => {
    if (value === "true") return true;
    if (value === "false") return false;
    return null;
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Instructions in <Link href="https://docs.google.com/document/d/1hHj-bi1kwWTgGTNnO1T5QSOj2YP6da9Vs5jf9I8xBe4">Google Doc</Link>.
          Only update fields that you want to change.
        </Typography>
        <br />
        <Typography variant="body1" gutterBottom>
          Enter a Vendor ID or Slug to update an existing vendor:
        </Typography>
        <Grid container spacing={3}>
          <Grid size={6}>
            <TextField
              label="Vendor ID"
              helperText="HMUA-123"
              variant="outlined"
              value={lookupId ?? ''}
              onChange={(e) => setLookupId(e.target.value)}
              required
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Vendor Slug"
              helperText="e.g., beauty-by-jane (unique URL identifier)"
              variant="outlined"
              value={lookupSlug ?? ''}
              onChange={(e) => setLookupSlug(e.target.value)}
              required
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Vendor Business Name"
              variant="outlined"
              value={newFormData.business_name ?? ''}
              onChange={(e) => handleTextFieldChange(e.target.value, 'business_name')}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="Website"
              variant="outlined"
              value={newFormData.website ?? ''}
              onChange={(e) => handleTextFieldChange(normalizeUrl(e.target.value), 'website')}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="Email"
              variant="outlined"
              value={newFormData.email ?? ''}
              onChange={(e) => handleTextFieldChange(e.target.value, 'email')}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              required
              label="Instagram Handle"
              variant="outlined"
              value={newFormData.instagram ?? ""}
              onChange={(e) => setFormData({ ...newFormData, instagram: e.target.value })}
              onBlur={(e) => {
                const normalized = normalizeInstagramHandle(e.target.value);
                if (normalized !== e.target.value) {
                  setFormData({ ...newFormData, instagram: normalized });
                }
              }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">@</InputAdornment>
                }
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={6}>
            <TextField
              fullWidth
              label="First Name"
              variant="outlined"
              value={firstName ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                const trimmedValue = value.trim();
                setFirstName(trimmedValue === '' ? null : value);
              }}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="Last Name"
              variant="outlined"
              value={lastName ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                const trimmedValue = value.trim();
                setLastName(trimmedValue === '' ? null : value);
              }}
            />
          </Grid>
          <Grid size={6}>
            <RegionSelector
              value={selectedRegion}
              onChange={(newRegion: RegionOption | null) => handleRegionChange(newRegion)}
            />
          </Grid>
          <Grid size={6}>
            <TagSelector
              value={selectedTags}
              onChange={(selectedTags: VendorTag[] | null) => handleTagChange(selectedTags)}
              options={tags}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="Latitude"
              helperText="Use numerical format (i.e. use negatives instead of cardinal directions)"
              variant="outlined"
              type="number"
              slotProps={{ htmlInput: { step: "any" } }}
              value={newFormData.latitude ?? ''}
              onChange={(e) => handleNumberFieldChange(e.target.value, 'latitude')}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label="Longitude"
              helperText="Use numerical format (i.e. use negatives instead of cardinal directions)"
              variant="outlined"
              type="number"
              slotProps={{ htmlInput: { step: "any" } }}
              value={newFormData.longitude ?? ''}
              onChange={(e) => handleNumberFieldChange(e.target.value, 'longitude')}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} my={2}>
          <Grid size={12}>
            <FormControl>
              <FormLabel id="demo-controlled-radio-buttons-group">Travels Worldwide</FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={newFormData.travels_world_wide === null ? 'null' : String(newFormData.travels_world_wide)}
                onChange={(e) => setFormData({ ...newFormData, travels_world_wide: parseBooleanString(e.target.value) })}
              >
                <FormControlLabel value="true" control={<Radio />} label="True" />
                <FormControlLabel value="false" control={<Radio />} label="False" />
                <FormControlLabel value="null" control={<Radio />} label="No Change" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Google Maps Place link"
              variant="outlined"
              value={newFormData.google_maps_place ?? ''}
              onChange={(e) => handleTextFieldChange(e.target.value, 'google_maps_place')}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={4}>
            <TextField
              label="Bridal Hair Price"
              variant="outlined"
              fullWidth
              value={newFormData.bridal_hair_price ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridal_hair_price')}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="Bridal Makeup Price"
              variant="outlined"
              fullWidth
              value={newFormData.bridal_makeup_price ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridal_makeup_price')}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="Bridal Hair & Makeup Price"
              variant="outlined"
              fullWidth
              value={newFormData["bridal_hair_&_makeup_price"] ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridal_hair_&_makeup_price')}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ my: 2 }}>
          <Grid size={4}>
            <TextField
              label="Bridesmaid Hair Price"
              variant="outlined"
              fullWidth
              value={newFormData.bridesmaid_hair_price ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridesmaid_hair_price')}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="Bridesmaid Makeup Price"
              variant="outlined"
              fullWidth
              value={newFormData.bridesmaid_makeup_price ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridesmaid_makeup_price')}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="Bridesmaid Hair & Makeup Price"
              variant="outlined"
              fullWidth
              value={newFormData["bridesmaid_hair_&_makeup_price"] ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridesmaid_hair_&_makeup_price')}
            />
          </Grid>
        </Grid>

        {/* Cover Image Upload Section */}
        {/* Cover Image Upload Section */}
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" gutterBottom>
            Cover Image
          </Typography>
          <ImageUpload
            ref={image.imageUploadRef}
            currentImageUrl={newFormData.cover_image?.media_url ?? undefined}
            onImageSelect={(file) =>
              image.handleSelect(
                file,
                previousBlobUrlRef,
                (url, options) => setFormData(prev => image.updateMediaUrl(prev, url, lookupId, options))
              )
            }
            disabled={!lookupSlug || image.loading}
            admin={true}
          />

          {newFormData.cover_image?.media_url && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Photo Credits"
                variant="outlined"
                value={newFormData.cover_image?.credits ?? ''}
                onChange={(e) =>
                  setFormData(prev => image.updateMediaMetadata(prev, {
                    credits: e.target.value || null
                  }))
                }
                helperText="Give credit to the photographer if applicable"
              />
              <FormControlLabel
                sx={{ mt: 1 }}
                control={
                  <Checkbox
                    checked={newFormData.cover_image?.consent_given ?? false}
                    onChange={(e) =>
                      setFormData(prev => image.updateMediaMetadata(prev, {
                        consent_given: e.target.checked
                      }))
                    }
                  />
                }
                label={
                  <Typography variant="body2">
                    Vendor has permission to use this photo
                  </Typography>
                }
              />
            </Box>
          )}
        </Box>
        <Divider />
        <Button
          variant="contained"
          color="primary"
          onClick={updateExistingVendor}
          fullWidth
          disabled={isSubmitting}
        >
          Update Vendor
        </Button>
      </Box>
    </Container >
  );
};