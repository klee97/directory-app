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
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { updateVendor } from '@/features/profile/common/api/updateVendor';
import { useNotification } from '@/contexts/NotificationContext';
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
import { vendorToFormData } from '@/lib/profile/vendorToFormTranslator';
import Checkbox from '@mui/material/Checkbox';
import LocationAutocomplete from '@/features/directory/components/filters/LocationAutocomplete';
import { useLocationForm } from '../../dashboard/hooks/useLocationForm';
import { getDisplayNameWithoutType } from '@/lib/location/locationNames';
import { getVendorByIdOrSlug } from '@/lib/vendor/fetchVendors';

export const AdminUpdateVendorManagement = () => {
  const { addNotification } = useNotification();
  const [newFormData, setFormData] = useState<VendorFormDataAdmin | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<VendorTag[] | null>(null);
  const { tags } = useTags();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVendor, setIsLoadingVendor] = useState(false);
  const [vendorLoaded, setVendorLoaded] = useState(false);
  const previousBlobUrlRef = useRef<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Separate state for lookup fields (immutable identifiers)
  const [lookupId, setLookupId] = useState<string>('');
  const [lookupSlug, setLookupSlug] = useState<string>('');

  const image = useImageUploadField();

  const locationForm = useLocationForm({
    initialLocation: newFormData?.locationResult,
    citiesOnly: true,
    onLocationChange: (location) => {
      if (location) {
        setFormData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            locationResult: {
              ...location,
              lat: location.lat ?? null,
              lon: location.lon ?? null,
              display_name: getDisplayNameWithoutType(
                location.address?.city,
                location.address?.state,
                location.address?.country
              ),
            },
          };
        });
      } else {
        setFormData(prev => prev ? { ...prev, locationResult: null } : prev);
      }
    },
  });

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (previousBlobUrlRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(previousBlobUrlRef.current);
      }
    };
  }, []);

  // Reset vendor loaded state when lookup fields change after a successful load
  const handleLookupIdChange = (value: string) => {
    setLookupId(value);
    if (vendorLoaded) setVendorLoaded(false);
  };

  const handleLookupSlugChange = (value: string) => {
    setLookupSlug(value);
    if (vendorLoaded) setVendorLoaded(false);
  };

  /**
   * Fetch existing vendor data by ID or slug and pre-populate the form.
   * Mirrors how the user-facing dashboard calls vendorToFormData on the
   * server-fetched vendor object.
   */
  const handleLoadVendor = async () => {
    const id = lookupId.trim();
    const slug = lookupSlug.trim();

    if (!id && !slug) {
      addNotification('Enter a Vendor ID or Slug to load vendor data.', 'error');
      return;
    }

    setIsLoadingVendor(true);
    setVendorLoaded(false);

    try {
      const vendor = await getVendorByIdOrSlug({ id: id || undefined, slug: slug || undefined });

      if (!vendor) {
        addNotification('No vendor found with those identifiers. Double-check the ID and Slug.', 'error');
        return;
      }

      // Translate the Vendor object into form-compatible data — same
      // approach used by vendorToFormData in VendorEditProfile.
      const loaded = vendorToFormData(vendor) as VendorFormDataAdmin;

      setFormData(loaded);

      // Populate lookup fields from the fetched vendor in case only one was provided
      if (!id && vendor.id) setLookupId(vendor.id);
      if (!slug && vendor.slug) setLookupSlug(vendor.slug);

      // Sync tag selector
      setSelectedTags(loaded.tags ?? null);

      // Reset the image field — the existing cover_image URL is already
      // part of the loaded form data so ImageUpload will render the preview.
      image.reset();

      setVendorLoaded(true);
      addNotification(`Loaded vendor: ${vendor.business_name ?? vendor.id}`, 'success');
    } catch (error) {
      addNotification(
        error instanceof Error ? `Error: ${error.message}` : 'Failed to load vendor.',
        'error'
      );
      console.error('Error loading vendor:', error);
    } finally {
      setIsLoadingVendor(false);
    }
  };

  // Helper function to handle text field changes - prevents empty strings
  const handleTextFieldChange = (value: string, field: keyof VendorDataInput) => {
    const trimmedValue = value.trim();
    setFormData(prev => prev ? { ...prev, [field]: trimmedValue === '' ? null : value } : prev);
  };

  const updateExistingVendor = async () => {
    if (!newFormData) return;
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

      console.debug("Updating vendor with ID:", vendorId, "Slug:", slug);

      const uploadedUrl = await image.uploadIfChanged(slug, newFormData.cover_image ?? null);
      console.debug("Image upload result:", uploadedUrl);

      let coverImage: VendorMediaForm | null;

      if (uploadedUrl === undefined) {
        coverImage = newFormData.cover_image ?? null;
      } else if (uploadedUrl === null) {
        coverImage = null;
      } else if (newFormData.cover_image) {
        coverImage = { ...newFormData.cover_image, media_url: uploadedUrl, vendor_id: vendorId };
      } else {
        coverImage = {
          media_url: uploadedUrl,
          vendor_id: vendorId,
          is_featured: true,
          consent_given: false,
          credits: null,
        } satisfies VendorMediaDraft;
      }

      const newVendorData = formDataToVendor(newFormData, coverImage?.media_url ?? null);
      const images: VendorMediaForm[] = coverImage ? [coverImage] : [];
      console.debug("New vendor data:", newVendorData);

      const data = await updateVendor(
        { id: vendorId },
        newVendorData,
        firstName,
        lastName,
        selectedTags,
        images
      );

      if (data) {
        if (data?.success) {
          addNotification("Vendor updated successfully!");
          setFormData(null);
          setFirstName(null);
          setLastName(null);
          setSelectedTags(null);
          setLookupId('');
          setLookupSlug('');
          setVendorLoaded(false);
          image.reset();
        } else {
          addNotification(data?.error ?? "Failed to update vendor. Please try again.", "error");
        }
      } else {
        addNotification("Failed to update vendor. Please try again.", "error");
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
    setFormData(prev => prev ? { ...prev, [field]: numberValue, lists_prices: numberValue !== null } : prev);
  };

  const handleTagChange = (value: VendorTag[] | null) => {
    setSelectedTags(value);
    setFormData(prev => prev ? { ...prev, tags: value ?? [] } : prev);
  };

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

        {/* ── Step 1: Lookup ── */}
        <Typography variant="body1" gutterBottom>
          Enter a Vendor ID or Slug, then click <strong>Load Vendor</strong> to
          pre-populate the form with existing data.
        </Typography>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid size={5}>
            <TextField
              label="Vendor ID"
              helperText="e.g. HMUA-123"
              variant="outlined"
              fullWidth
              value={lookupId}
              onChange={(e) => handleLookupIdChange(e.target.value)}
              required
            />
          </Grid>
          <Grid size={5}>
            <TextField
              label="Vendor Slug"
              helperText="e.g. beauty-by-jane"
              variant="outlined"
              fullWidth
              value={lookupSlug}
              onChange={(e) => handleLookupSlugChange(e.target.value)}
              required
            />
          </Grid>
          <Grid size={2} sx={{ display: 'flex', alignItems: 'center', pt: '6px' }}>
            <Button
              variant="outlined"
              onClick={handleLoadVendor}
              disabled={isLoadingVendor || (!lookupId.trim() && !lookupSlug.trim())}
              fullWidth
              startIcon={isLoadingVendor ? <CircularProgress size={16} /> : null}
            >
              {isLoadingVendor ? 'Loading…' : 'Load'}
            </Button>
          </Grid>
        </Grid>

        {vendorLoaded && (
          <Alert severity="info" sx={{ mt: 2, mb: 1 }}>
            Vendor data loaded. Edit any fields below, then click <strong>Update Vendor</strong> to save.
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        {/* ── Step 2: Edit fields (only shown after a vendor is loaded) ── */}
        {!vendorLoaded ? (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body1">
              Enter a Vendor ID and/or Slug above, then click <strong>Load</strong> to populate the form.
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Vendor Business Name"
                  variant="outlined"
                  value={newFormData!.business_name ?? ''}
                  onChange={(e) => handleTextFieldChange(e.target.value, 'business_name')}
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Website"
                  variant="outlined"
                  value={newFormData!.website ?? ''}
                  onChange={(e) => handleTextFieldChange(normalizeUrl(e.target.value), 'website')}
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Email"
                  variant="outlined"
                  value={newFormData!.email ?? ''}
                  onChange={(e) => handleTextFieldChange(e.target.value, 'email')}
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Instagram Handle"
                  variant="outlined"
                  value={newFormData!.instagram ?? ""}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, instagram: e.target.value } : prev)}
                  onBlur={(e) => {
                    const normalized = normalizeInstagramHandle(e.target.value);
                    if (normalized !== e.target.value) {
                      setFormData(prev => prev ? { ...prev, instagram: normalized } : prev);
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
                    setFirstName(value.trim() === '' ? null : value);
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
                    setLastName(value.trim() === '' ? null : value);
                  }}
                />
              </Grid>
              <Grid size={6}>
                <TagSelector
                  value={selectedTags}
                  onChange={(selectedTags: VendorTag[] | null) => handleTagChange(selectedTags)}
                  options={tags}
                />
              </Grid>
              <Grid size={12}>
                <LocationAutocomplete
                  inputValue={locationForm.locationInputValue}
                  onInputChange={locationForm.handleLocationInputChange}
                  onDebouncedChange={locationForm.handleLocationDebouncedChange}
                  selectedLocation={locationForm.selectedLocation}
                  onSelect={locationForm.handleSelectLocation}
                  results={locationForm.combinedLocationResults}
                  loading={locationForm.isLoading}
                  placeholder="Select your primary city location"
                />
              </Grid>
            </Grid>

            <Grid container spacing={3} my={2}>
              <Grid size={12}>
                <FormControl>
                  <FormLabel>Travels Worldwide</FormLabel>
                  <RadioGroup
                    value={newFormData!.travels_world_wide === null ? 'null' : String(newFormData!.travels_world_wide)}
                    onChange={(e) =>
                      setFormData(prev => {
                        if (!prev) return prev;
                        const parsed = parseBooleanString(e.target.value);
                        // If parsed is null, treat it as "No Change" and leave form data unchanged.
                        if (parsed === null) return prev;
                        return { ...prev, travels_world_wide: parsed };
                      })
                    }
                  >
                    <FormControlLabel value="true" control={<Radio />} label="True" />
                    <FormControlLabel value="false" control={<Radio />} label="False" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Google Maps Place link"
                  variant="outlined"
                  value={newFormData!.google_maps_place ?? ''}
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
                  value={newFormData!.bridal_hair_price ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridal_hair_price')}
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Bridal Makeup Price"
                  variant="outlined"
                  fullWidth
                  value={newFormData!.bridal_makeup_price ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridal_makeup_price')}
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Bridal Hair & Makeup Price"
                  variant="outlined"
                  fullWidth
                  value={newFormData!["bridal_hair_&_makeup_price"] ?? ''}
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
                  value={newFormData!.bridesmaid_hair_price ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridesmaid_hair_price')}
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Bridesmaid Makeup Price"
                  variant="outlined"
                  fullWidth
                  value={newFormData!.bridesmaid_makeup_price ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridesmaid_makeup_price')}
                />
              </Grid>
              <Grid size={4}>
                <TextField
                  label="Bridesmaid Hair & Makeup Price"
                  variant="outlined"
                  fullWidth
                  value={newFormData!["bridesmaid_hair_&_makeup_price"] ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridesmaid_hair_&_makeup_price')}
                />
              </Grid>
            </Grid>

            {/* Cover Image Upload Section */}
            <Box sx={{ my: 3 }}>
              <Typography variant="h6" gutterBottom>
                Cover Image
              </Typography>
              {imageError && (
                <Typography variant="body1" color="error" sx={{ mb: 1 }}>
                  {imageError}
                </Typography>
              )}
              <ImageUpload
                ref={image.imageUploadRef}
                currentImageUrl={image.previewUrl ?? newFormData!.cover_image?.media_url ?? undefined}
                onError={setImageError}
                onImageSelect={(file) => {
                  setImageError(null);
                  image.handleSelect(
                    file,
                    previousBlobUrlRef,
                    (url, options) => setFormData(prev => prev ? image.updateMediaUrl(prev, url, lookupId, true, options) : prev)
                  );
                }}
                disabled={!lookupSlug || image.loading}
                admin={true}
              />

              {newFormData!.cover_image?.media_url && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Photo Credits"
                    variant="outlined"
                    value={newFormData!.cover_image?.credits ?? ''}
                    onChange={(e) =>
                      setFormData(prev => prev ? image.updateMediaMetadata(prev, {
                        credits: e.target.value || null
                      }) : prev)
                    }
                    helperText="Give credit to the photographer if applicable"
                  />
                  <FormControlLabel
                    sx={{ mt: 1 }}
                    control={
                      <Checkbox
                        checked={newFormData!.cover_image?.consent_given ?? false}
                        onChange={(e) =>
                          setFormData(prev => prev ? image.updateMediaMetadata(prev, {
                            consent_given: e.target.checked
                          }) : prev)
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
              sx={{ mt: 2 }}
            >
              {isSubmitting ? 'Updating…' : 'Update Vendor'}
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};