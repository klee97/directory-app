"use client";

import React, { useState } from 'react';
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
import { useImageUploader } from '@/features/profile/common/hooks/useImageUploader';
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

const RECOMMENDED_BIO_WORD_COUNT = 50;

interface EditFormViewProps {
  activeSection: string | null;
  sections: Section[];
  formData: VendorFormData;
  setFormData: React.Dispatch<React.SetStateAction<VendorFormData>>;
  handleBackToMenu: () => void;
  handleSave: () => void;
  isSaving: boolean;
  vendorIdentifier?: string;
  tags: VendorTag[];
}

export default function EditFormView({
  activeSection,
  sections,
  formData,
  setFormData,
  handleBackToMenu,
  handleSave,
  isSaving,
  vendorIdentifier,
  tags
}: EditFormViewProps) {
  const { upload, loading } = useImageUploader();
  const [showValidation, setShowValidation] = useState(false);

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

  const handleCoverImageSelect = async (file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, cover_image: null }));
      return;
    }
    try {
      const url = await upload(file, vendorIdentifier);
      setFormData(prev => ({ ...prev, cover_image: url }));
    } catch {
      // error notification handled in hook
    }
  };

  const handleSaveClick = () => {
    if (!validationResult.isValid) {
      setShowValidation(true);
      return;
    }

    // Save data
    handleSave();

    // Hide validation after a successful save
    setShowValidation(false);
  };

  // Helper to get error message for a field
  const getFieldError = (fieldName: VendorFormField): string | null => {
    if (!showValidation) return null;
    return validationResult.errors[fieldName] ?? null;
  };

  const isSaveDisabled = loading;

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
          {Object.entries(validationResult.errors).map(([field, error]) => (
            <Typography key={field} variant="body2" sx={{ mt: 0.5 }}>
              • {error}
            </Typography>
          ))}
        </Box>
      )}

      {/* Scrollable content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        {activeSection === 'cover' && (
          <Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload a cover image to showcase your work
            </Typography>
            <ImageUpload
              currentImageUrl={formData.cover_image ?? undefined}
              onImageSelect={handleCoverImageSelect}
              disabled={loading}
            />
          </Box>
        )}

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
              {getFieldError('location') && (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                  {getFieldError('location')}
                </Typography>
              )}
            </Grid>
            <Grid size={12}>
              <FormControl>
                <FormFieldLabel>Travels Worldwide</FormFieldLabel>
                <RadioGroup
                  value={String(formData.travels_world_wide)}
                  onChange={(e) => setFormData({ ...formData, travels_world_wide: e.target.value === 'true' })}
                >
                  <FormControlLabel value="true" control={<Radio />} label="Yes" />
                  <FormControlLabel value="false" control={<Radio />} label="No" />
                </RadioGroup>
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
              />
            </Grid>
            <Grid size={12}>
              <FormFieldLabel>Google Maps Place Link</FormFieldLabel>
              <TextField
                fullWidth
                value={formData.google_maps_place}
                onChange={(e) => setFormData({ ...formData, google_maps_place: e.target.value })}
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
                      onChange={(e) => setFormData({
                        ...formData,
                        "bridal_hair_&_makeup_price":
                          e.target.value === '' || Number(e.target.value) === 0 ? null : Number(e.target.value)
                      })}
                      error={getFieldError('bridal_hair_&_makeup_price') ? true : false}
                      helperText={getFieldError('bridal_hair_&_makeup_price')}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: {
                            min: 0
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
                      onChange={(e) => setFormData({
                        ...formData,
                        bridal_hair_price:
                          e.target.value === '' || Number(e.target.value) === 0 ? null : Number(e.target.value)
                      })}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: {
                            min: 0
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
                      onChange={(e) => setFormData({
                        ...formData,
                        bridal_makeup_price:
                          e.target.value === '' || Number(e.target.value) === 0 ? null : Number(e.target.value)
                      })}
                      error={getFieldError('bridal_makeup_price') ? true : false}
                      helperText={getFieldError('bridal_makeup_price')}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: {
                            min: 0
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
                      onChange={(e) => setFormData({
                        ...formData,
                        "bridesmaid_hair_&_makeup_price":
                          e.target.value === '' || Number(e.target.value) === 0 ? null : Number(e.target.value)
                      })}
                      error={getFieldError('bridesmaid_hair_&_makeup_price') ? true : false}
                      helperText={getFieldError('bridesmaid_hair_&_makeup_price')}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: {
                            min: 0
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
                      onChange={(e) => setFormData({
                        ...formData,
                        bridesmaid_hair_price:
                          e.target.value === '' || Number(e.target.value) === 0 ? null : Number(e.target.value)
                      })}
                      error={getFieldError('bridesmaid_hair_price') ? true : false}
                      helperText={getFieldError('bridesmaid_hair_price')}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: {
                            min: 0
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
                      onChange={(e) => setFormData({
                        ...formData,
                        bridesmaid_makeup_price:
                          e.target.value === '' || Number(e.target.value) === 0 ? null : Number(e.target.value)
                      })}
                      error={getFieldError('bridesmaid_makeup_price') ? true : false}
                      helperText={getFieldError('bridesmaid_makeup_price')}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: {
                            min: 0
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
              Tell clients about your artistic style, experience, and what makes your work unique. Aim for at least 50 words.
            </Typography>
            {(() => {
              const text = formData.description || '';
              const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
              const remaining = Math.max(RECOMMENDED_BIO_WORD_COUNT - wordCount, 0);

              const fieldError = getFieldError('description');

              let helperText;
              if (fieldError) {
                helperText = fieldError;
              } else if (wordCount === 0 || wordCount < RECOMMENDED_BIO_WORD_COUNT) {
                helperText = `${wordCount} of ${RECOMMENDED_BIO_WORD_COUNT} words (${remaining} more to go)`;
              } else {
                helperText = `${wordCount} words — great! Your bio gives clients a good sense of who you are.`;
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
              We recommend a photo with natural lighting or an outdoor setting.
            </Typography>
            <Button variant="outlined" component="label">
              Upload Photo
              <input type="file" hidden accept="image/*" multiple />
            </Button>
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
