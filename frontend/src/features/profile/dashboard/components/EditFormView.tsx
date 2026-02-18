"use client";

import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Grid from '@mui/material/Grid2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ImageUpload } from '@/features/profile/common/components/ImageUpload';
import TagSelector from '@/features/profile/common/components/TagSelector';
import { hasTagByName, VendorSpecialty } from '@/types/tag';
import LocationAutocomplete from '@/features/directory/components/filters/LocationAutocomplete';
import { useLocationForm } from '@/features/profile/dashboard/hooks/useLocationForm';
import { getDisplayNameWithoutType } from '@/lib/location/locationNames';
import { VendorFormData, VendorFormField } from '@/types/vendorFormData';
import { VendorTag } from '@/types/vendor';
import { Section, ValidationResult } from './Section';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import { normalizeInstagramHandle } from '@/lib/profile/normalizeInstagram';
import CircularProgress from '@mui/material/CircularProgress';
import { useImageUploadField } from '../../common/hooks/useImageUploadField';
import { normalizeUrl } from '@/lib/profile/normalizeUrl';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';

export const RECOMMENDED_BIO_WORD_COUNT = 50;
export const MIN_SERVICE_PRICE = 0;
export const MAX_SERVICE_PRICE = 99999; // maximum price for validation

interface EditFormViewProps {
  activeSection: string | null;
  sections: Section[];
  formData: VendorFormData;
  setFormData: React.Dispatch<React.SetStateAction<VendorFormData>>;
  handleBackToMenu: () => void;
  handleSave: (dataToSave: VendorFormData) => void;
  vendorSlug: string;
  vendorId: string;
  tags: VendorTag[];
}

export default function EditFormView({
  activeSection,
  sections,
  formData,
  setFormData,
  handleBackToMenu,
  handleSave,
  vendorSlug,
  vendorId,
  tags
}: EditFormViewProps) {

  const [showValidation, setShowValidation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [priceErrors, setPriceErrors] = useState<Partial<Record<string, string | null>>>({});
  const previousBlobUrlRef = useRef<string | null>(null);

  const image = useImageUploadField();
  const loading = image.loading || isSaving;

  const locationForm = useLocationForm({
    initialLocation: formData.locationResult,
    citiesOnly: true,
    onLocationChange: (location) => {
      if (location) {
        setFormData(prev => ({
          ...prev,
          locationResult: {
            ...location,
            display_name: getDisplayNameWithoutType(location.address?.city, location.address?.state, location.address?.country),
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          locationResult: null
        }));
      }
    },
  });
  // Separate tags by type
  const serviceOptions = tags.filter(tag => tag.type === 'SERVICE');
  const skillOptions = tags.filter(tag => tag.type === 'SKILL');
  const currentSection = sections.find(s => s.id === activeSection);
  const validationResult: ValidationResult =
    currentSection?.validate(formData) ?? {
      isValid: true,
      isComplete: true,
      isEmpty: false,
      errors: {}
    };

  const handleSaveClick = async () => {
    // Check for price errors first
    if (hasPriceErrors) {
      return; // Errors are already shown, no need to do anything
    }

    if (!validationResult.isValid) {
      setShowValidation(true);
      return;
    }
    try {
      setIsSaving(true);
      // Upload image if changed and get the real URL
      const uploadedUrl = await image.uploadIfChanged(vendorSlug, formData.cover_image);
      // Ensure the constructed object includes required VendorMediaBase fields
      const coverImage = uploadedUrl === undefined
        ? formData.cover_image          // unchanged
        : uploadedUrl === null
          ? null                         // cleared
          : {
              ...(formData.cover_image ?? {}),
              media_url: uploadedUrl,
              vendor_id: vendorId,
              // Provide defaults for VendorMediaBase fields so the shape matches VendorMediaForm
              consent_given: formData.cover_image?.consent_given ?? false,
              credits: formData.cover_image?.credits ?? null,
              is_featured: formData.cover_image?.is_featured ?? false,
            };

      handleSave({ ...formData, cover_image: coverImage });
      setShowValidation(false);

    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (previousBlobUrlRef.current?.startsWith('blob:')) {
        URL.revokeObjectURL(previousBlobUrlRef.current);
      }
    };
  }, []);

  // Clear price errors when section changes
  useEffect(() => {
    setPriceErrors({});
  }, [activeSection]);

  // Helper to validate a price value
  const validatePrice = (value: number | null): string | null => {
    if (value === null || value === undefined) return null;
    if (value < MIN_SERVICE_PRICE) return 'Price cannot be negative';
    if (value > MAX_SERVICE_PRICE) return `Price cannot exceed $${MAX_SERVICE_PRICE.toLocaleString()}`;
    return null;
  };

  // Helper to handle price change with validation
  const handlePriceChange = (fieldName: keyof VendorFormData, value: string) => {
    const numValue = value === '' || Number(value) === 0 ? null : Number(value);

    // Update form data
    setFormData({
      ...formData,
      [fieldName]: numValue
    });

    // Validate and update error state
    const error = validatePrice(numValue);
    setPriceErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  // Helper to get error message for a field
  const getFieldError = (fieldName: VendorFormField): string | null => {
    // Always show price errors in real-time
    if (priceErrors[fieldName]) {
      return priceErrors[fieldName] ?? null;
    }
    // Show other validation errors only after save attempt
    if (!showValidation) return null;
    return validationResult.errors[fieldName] ?? null;
  };

  const hasPriceErrors = Object.values(priceErrors).some(error => error !== null && error !== undefined);
  const isSaveDisabled = loading || hasPriceErrors;

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      opacity: isSaving ? 0.6 : 1,
      pointerEvents: isSaving ? 'none' : 'auto',
      transition: 'opacity 0.2s'
    }}>
      {/* Loading overlay */}
      {isSaving && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 1000,
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Saving...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Header with back button */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={handleBackToMenu} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {currentSection?.label}
        </Typography>
      </Box>

      {/* Show validation alert at top if there are errors */}
      {showValidation && !validationResult.isValid && (
        <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="body2">
            {Object.keys(validationResult.errors).length > 0
              ? 'Please fix the errors below before saving'
              : 'Please fill out all required fields before saving'}
          </Typography>
        </Box>
      )}

      {/* Scrollable content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>

        {activeSection === 'business' && (
          <Grid container spacing={3}>
            <Grid size={12}>
              <FormFieldLabel required>Business Name</FormFieldLabel>
              <TextField
                fullWidth
                required
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                error={!!getFieldError('business_name')}
                helperText={getFieldError('business_name')}
              />
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth error={!!getFieldError('location')}>
                <FormFieldLabel required>Location</FormFieldLabel>
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
                <FormHelperText>
                  {getFieldError('location')}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth error={!!getFieldError('travels_world_wide')}>
                <FormFieldLabel>Travels Worldwide</FormFieldLabel>
                <RadioGroup
                  value={String(formData.travels_world_wide)}
                  onChange={(e) => setFormData({ ...formData, travels_world_wide: e.target.value === 'true' })}
                >
                  <FormControlLabel value="true" control={<Radio />} label="Yes" />
                  <FormControlLabel value="false" control={<Radio />} label="No" />
                </RadioGroup>
                <FormHelperText>
                  {getFieldError('travels_world_wide')}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        )}

        {activeSection === 'links' && (
          <Grid container spacing={3}>
            <Grid size={12}>
              <FormFieldLabel>Website</FormFieldLabel>
              <TextField
                fullWidth
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                onBlur={(e) => {
                  const normalized = normalizeUrl(e.target.value);
                  setFormData({ ...formData, website: normalized });
                }}
                error={!!getFieldError('website')}
                helperText={getFieldError('website')}
              />
            </Grid>
            <Grid size={12}>
              <FormFieldLabel required>Instagram Handle</FormFieldLabel>
              <TextField
                fullWidth
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                onBlur={(e) => {
                  const normalized = normalizeInstagramHandle(e.target.value);
                  if (normalized !== e.target.value) {
                    setFormData({ ...formData, instagram: normalized });
                  }
                }}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">@</InputAdornment>
                  }
                }}
                error={!!getFieldError('instagram')}
                helperText={getFieldError('instagram')}
              />
            </Grid>
            <Grid size={12}>
              <FormFieldLabel>Google Maps Link</FormFieldLabel>
              <TextField
                fullWidth
                value={formData.google_maps_place}
                onChange={(e) => setFormData({ ...formData, google_maps_place: e.target.value })}
                onBlur={(e) => {
                  const normalized = normalizeUrl(e.target.value);
                  setFormData({ ...formData, google_maps_place: normalized });
                }}
                error={!!getFieldError('google_maps_place')}
                helperText={getFieldError('google_maps_place')}
              />
            </Grid>
          </Grid>
        )}

        {activeSection === 'pricing' && (
          <Grid container spacing={3}>
            {/* Determine selected services */}
            {(() => {
              const showHair = hasTagByName(formData.tags, VendorSpecialty.SPECIALTY_HAIR);
              const showMakeup = hasTagByName(formData.tags, VendorSpecialty.SPECIALTY_MAKEUP);
              return <>
                {showHair && showMakeup && (
                  <Grid size={12}>
                    <FormFieldLabel>Bridal Hair & Makeup Price</FormFieldLabel>
                    <TextField
                      fullWidth
                      type="number"
                      value={formData["bridal_hair_&_makeup_price"] || ''}
                      onChange={(e) => handlePriceChange("bridal_hair_&_makeup_price", e.target.value)}
                      error={getFieldError('bridal_hair_&_makeup_price') ? true : false}
                      helperText={getFieldError('bridal_hair_&_makeup_price')}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: {
                            min: MIN_SERVICE_PRICE,
                            max: MAX_SERVICE_PRICE
                          }
                        }
                      }}
                    />
                  </Grid>
                )}
                {showHair && (
                  <Grid size={12}>
                    <FormFieldLabel>Bridal Hair Price</FormFieldLabel>
                    <TextField
                      fullWidth
                      type="number"
                      value={formData.bridal_hair_price || ''}
                      error={getFieldError('bridal_hair_price') ? true : false}
                      helperText={getFieldError('bridal_hair_price')}
                      onChange={(e) => handlePriceChange('bridal_hair_price', e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: {
                            min: MIN_SERVICE_PRICE,
                            max: MAX_SERVICE_PRICE
                          }
                        }
                      }}
                    />
                  </Grid>
                )}
                {showMakeup && (
                  <Grid size={12}>
                    <FormFieldLabel>Bridal Makeup Price</FormFieldLabel>
                    <TextField
                      fullWidth
                      type="number"
                      value={formData.bridal_makeup_price || ''}
                      onChange={(e) => handlePriceChange('bridal_makeup_price', e.target.value)}
                      error={getFieldError('bridal_makeup_price') ? true : false}
                      helperText={getFieldError('bridal_makeup_price')}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: {
                            min: MIN_SERVICE_PRICE,
                            max: MAX_SERVICE_PRICE
                          }
                        }
                      }}
                    />
                  </Grid>
                )}
                {showHair && showMakeup && (
                  <Grid size={12}>
                    <FormFieldLabel>Bridesmaid Hair & Makeup Price</FormFieldLabel>
                    <TextField
                      fullWidth
                      type="number"
                      value={formData["bridesmaid_hair_&_makeup_price"] || ''}
                      onChange={(e) => handlePriceChange("bridesmaid_hair_&_makeup_price", e.target.value)}
                      error={getFieldError('bridesmaid_hair_&_makeup_price') ? true : false}
                      helperText={getFieldError('bridesmaid_hair_&_makeup_price')}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: {
                            min: MIN_SERVICE_PRICE,
                            max: MAX_SERVICE_PRICE
                          }
                        }
                      }}
                    />
                  </Grid>
                )}
                {showHair && (
                  <Grid size={12}>
                    <FormFieldLabel>Bridesmaid Hair Price</FormFieldLabel>
                    <TextField
                      fullWidth
                      type="number"
                      value={formData.bridesmaid_hair_price || ''}
                      onChange={(e) => handlePriceChange('bridesmaid_hair_price', e.target.value)}
                      error={getFieldError('bridesmaid_hair_price') ? true : false}
                      helperText={getFieldError('bridesmaid_hair_price')}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: {
                            min: MIN_SERVICE_PRICE,
                            max: MAX_SERVICE_PRICE
                          }
                        }
                      }}
                    />
                  </Grid>
                )}
                {showMakeup && (
                  <Grid size={12}>
                    <FormFieldLabel>Bridesmaid Makeup Price</FormFieldLabel>
                    <TextField
                      fullWidth
                      type="number"
                      value={formData.bridesmaid_makeup_price || ''}
                      onChange={(e) => handlePriceChange('bridesmaid_makeup_price', e.target.value)}
                      error={getFieldError('bridesmaid_makeup_price') ? true : false}
                      helperText={getFieldError('bridesmaid_makeup_price')}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: {
                            min: MIN_SERVICE_PRICE,
                            max: MAX_SERVICE_PRICE
                          }
                        }
                      }}
                    />
                  </Grid>
                )}
              </>;
            })()}
          </Grid>
        )}

        {activeSection === 'bio' && (
          <Box>
            <FormFieldLabel required>Artist Bio</FormFieldLabel>
            <Typography variant="body2" color="text.primary" gutterBottom>
              Tell clients about your artistic style, experience, and what makes your work unique. Aim for at least {RECOMMENDED_BIO_WORD_COUNT} words.
            </Typography>
            {(() => {
              const text = formData.description || '';
              const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
              const fieldError = getFieldError('description');

              let helperText;
              if (fieldError) {
                helperText = fieldError;
              } else {
                helperText = `Length: ${wordCount} words`;
              }

              return (
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  required
                  value={text}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  error={!!fieldError}
                  helperText={helperText}
                />
              );
            })()}
          </Box>
        )}

        {activeSection === 'image' && (
          <Box>
            <FormFieldLabel>Upload a client photo</FormFieldLabel>
            <Typography variant="body2" color="text.primary" gutterBottom>
              We recommend a vertical (portrait) photo with natural lighting or an outdoor setting.
            </Typography>
            <ImageUpload
              ref={image.imageUploadRef}
              currentImageUrl={formData.cover_image?.media_url ?? undefined}
              onImageSelect={(file) =>
                image.handleSelect(
                  file,
                  previousBlobUrlRef,
                  (url, options) => setFormData(prev => image.updateMediaUrl(prev, url, vendorId, options))
                )
              }
              disabled={image.loading}
            />
            {formData.cover_image?.media_url && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="Photo Credit"
                    fullWidth
                    value={formData.cover_image?.credits ?? ''}
                    onChange={(e) =>
                      setFormData(prev => image.updateMediaMetadata(prev, {
                        credits: e.target.value || null
                      }))
                    }
                    helperText="Give credit to the photographer if applicable"
                  />
                </Box>
                {getFieldError('cover_image') && (
                  <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    {getFieldError('cover_image')}
                  </Typography>
                )}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.cover_image?.consent_given ?? false}
                      onChange={(e) =>
                        setFormData(prev => image.updateMediaMetadata(prev, {
                          consent_given: e.target.checked
                        }))
                      }
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I confirm I have permission to use this photo and all necessary rights & licenses
                    </Typography>
                  }
                />
              </Box>

            )}
          </Box>
        )}
        {activeSection === 'services' && (
          <Box>
            <Grid container spacing={3}>
              <Grid size={12}>
                <FormFieldLabel required>Services offered</FormFieldLabel>
                <TagSelector
                  value={formData.tags.filter(tag => tag.type === 'SERVICE')}
                  onChange={(newServiceTags) => {
                    // Merge with existing skills
                    const skillTags = formData.tags.filter(tag => tag.type === 'SKILL');
                    const serviceTags = newServiceTags ?? [];
                    setFormData(prev => ({
                      ...prev,
                      tags: [
                        ...serviceTags, // Only keep selected services
                        ...skillTags
                      ]
                    }));
                  }}
                  options={serviceOptions}
                />
                {getFieldError('services') && (
                  <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    {getFieldError('services')}
                  </Typography>
                )}
              </Grid>
              <Grid size={12}>

                <FormFieldLabel>Additional skills</FormFieldLabel>
                <TagSelector
                  value={formData.tags.filter(tag => tag.type === 'SKILL')}
                  onChange={(newSkillTags) => {
                    // Merge with existing services, remove any skills not selected
                    const serviceTags = formData.tags.filter(tag => tag.type === 'SERVICE');
                    const skillTags = newSkillTags ?? [];
                    setFormData(prev => ({
                      ...prev,
                      tags: [
                        ...serviceTags,
                        ...skillTags // Only keep selected skills
                      ]
                    }));
                  }}
                  options={skillOptions}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {/* Footer with save button */}
      <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleSaveClick}
          disabled={isSaveDisabled}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box >
  );
}

interface FormFieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

const FormFieldLabel: React.FC<FormFieldLabelProps> = ({ children, required = false }) => (
  <Typography
    variant="subtitle1"
    color="text.secondary"
    sx={{ mb: 1, display: 'block', fontWeight: 500 }}
  >
    {children}{required && '*'}
  </Typography>
);
