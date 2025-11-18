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
import { useLocationForm } from '@/features/profile/manage/hooks/useLocationForm';
import { getDisplayNameWithoutType } from '@/lib/location/locationNames';
import { VendorFormData } from '@/types/vendorFormData';
import { VendorTag } from '@/types/vendor';
import { Section } from './Section';


// Typed shape for the editable form data (draft)
interface EditFormViewProps {
  activeSection: string | null;
  sections: Section[];
  formData: VendorFormData;
  setFormData: React.Dispatch<React.SetStateAction<VendorFormData>>;
  handleBackToMenu: () => void;
  handleSave: () => void;
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
  const validationResult = currentSection?.validate(formData) ?? { isValid: true, errors: {} };

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
  const getFieldError = (fieldName: string): string | null => {
    if (!showValidation) return null;
    const errors = validationResult.errors as Record<string, string | null>;
    return errors[fieldName] ?? null;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
            Please fill out all required fields before saving
          </Typography>
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
                label="Website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <FormFieldLabel required>Instagram Handle</FormFieldLabel>
              <TextField
                fullWidth
                helperText="Your handle (without @ symbol)"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
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
                {showHair && (
                  <>
                    <Grid size={12}>
                      <FormFieldLabel>Bridal Hair Price</FormFieldLabel>
                      <TextField
                        fullWidth
                        type="number"
                        placeholder="$"
                        value={formData.bridal_hair_price || ''}
                        onChange={(e) => setFormData({ ...formData, bridal_hair_price: e.target.value ? Number(e.target.value) : null })}
                      />
                    </Grid>
                    <Grid size={12}>
                      <FormFieldLabel>Bridesmaid Hair Price</FormFieldLabel>
                      <TextField
                        fullWidth
                        type="number"
                        placeholder="$"
                        value={formData.bridesmaid_hair_price || ''}
                        onChange={(e) => setFormData({ ...formData, bridesmaid_hair_price: e.target.value ? Number(e.target.value) : null })}
                      />
                    </Grid>
                  </>
                )}
                {showMakeup && (
                  <>
                    <Grid size={12}>
                      <FormFieldLabel>Bridal Makeup Price</FormFieldLabel>
                      <TextField
                        fullWidth
                        type="number"
                        placeholder="$"
                        value={formData.bridal_makeup_price || ''}
                        onChange={(e) => setFormData({ ...formData, bridal_makeup_price: e.target.value ? Number(e.target.value) : null })}
                      />
                    </Grid>
                    <Grid size={12}>
                      <FormFieldLabel>Bridesmaid Makeup Price</FormFieldLabel>
                      <TextField
                        fullWidth
                        type="number"
                        placeholder="$"
                        value={formData.bridesmaid_makeup_price || ''}
                        onChange={(e) => setFormData({ ...formData, bridesmaid_makeup_price: e.target.value ? Number(e.target.value) : null })}
                      />
                    </Grid>
                  </>
                )}
                {showHair && showMakeup && (
                  <>
                    <Grid size={12}>
                      <FormFieldLabel>Bridal Hair & Makeup Price</FormFieldLabel>
                      <TextField
                        fullWidth
                        type="number"
                        placeholder="$"
                        value={formData["bridal_hair_&_makeup_price"] || ''}
                        onChange={(e) => setFormData({ ...formData, "bridal_hair_&_makeup_price": e.target.value ? Number(e.target.value) : null })}
                      />
                    </Grid>
                    <Grid size={12}>
                      <FormFieldLabel>Bridal Hair & Makeup Price</FormFieldLabel>
                      <TextField
                        fullWidth
                        type="number"
                        placeholder="$"
                        value={formData["bridesmaid_hair_&_makeup_price"] || ''}
                        onChange={(e) => setFormData({ ...formData, "bridesmaid_hair_&_makeup_price": e.target.value ? Number(e.target.value) : null })}
                      />
                    </Grid>
                  </>
                )}
              </>;
            })()}
          </Grid>
        )}

        {activeSection === 'bio' && (
          <Box>
            <FormFieldLabel required>Artist Bio</FormFieldLabel>
            <TextField
              fullWidth
              multiline
              rows={8}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={!!getFieldError('description')}
              helperText={getFieldError('description')}
            />
          </Box>
        )}

        {activeSection === 'image' && (
          <Box>
            <FormFieldLabel>Upload a client photo</FormFieldLabel>
            <Typography variant="body2" color="text.primary" gutterBottom>
              We recommend a photo with natural lighting or an outdoor setting.
            </Typography>
            <Button variant="outlined" component="label">
              Upload Photos
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
          onClick={() => {
            handleSaveClick();
          }}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
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
