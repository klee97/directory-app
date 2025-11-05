"use client";

import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Grid from '@mui/material/Grid2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ImageUpload } from '@/features/profile/common/components/ImageUpload';
import { useImageUploader } from '@/features/profile/common/hooks/useImageUploader';
import { getDefaultBio } from '@/features/profile/common/utils/bio';
import TagSelector from '@/features/profile/common/components/TagSelector';
import { useTags } from '@/features/profile/common/hooks/useTags';
import { VendorTag } from '@/types/vendor';
import { hasTagByName, VendorSpecialty } from '@/types/tag';
// import LocationAutocomplete from '@/features/directory/components/filters/LocationAutocomplete';
// import { useLocationForm } from '@/features/profile/manage/hooks/useLocationForm';
// import { LocationResult } from '@/types/location';
// import { getDisplayNameWithoutType } from '@/lib/location/locationNames';

interface Section {
  id: string;
  label: string;
  required?: boolean;
}

// Typed shape for the editable form data (draft). Keep in sync with the
// initial state used in `EditableVendorProfile`.
export interface VendorFormData {
  business_name: string;
  location: string;
  // locationResult: LocationResult;
  travels_world_wide: boolean;
  website: string;
  instagram: string;
  google_maps_place: string;
  description: string;
  bridal_hair_price: number | null;
  bridal_makeup_price: number | null;
  bridal_hair_makeup_price: number | null;
  bridesmaid_hair_price: number | null;
  bridesmaid_makeup_price: number | null;
  bridesmaid_hair_makeup_price: number | null;
  cover_image: string | null;
  tags: VendorTag[];
  images: string[] | null;
}

interface EditFormViewProps {
  activeSection: string | null;
  sections: Section[];
  formData: VendorFormData;
  setFormData: React.Dispatch<React.SetStateAction<VendorFormData>>;
  handleBackToMenu: () => void;
  handleSave: () => void;
  markSectionComplete: (id: string) => void;
  vendorIdentifier?: string;
}

export default function EditFormView({
  activeSection,
  sections,
  formData,
  setFormData,
  handleBackToMenu,
  handleSave,
  markSectionComplete,
  vendorIdentifier,
}: EditFormViewProps) {
  const { upload, loading } = useImageUploader();
  const { tags: tagOptions } = useTags();


  // const locationForm = useLocationForm({
  //   citiesOnly: true,
  //   onLocationChange: (location) => {
  //     if (location) {
  //       setFormData(prev => ({
  //         ...prev,
  //         location: {
  //           ...location,
  //           display_name: getDisplayNameWithoutType(location.address?.city, location.address?.state, location.address?.country),
  //         }
  //       }));
  //     } else {
  //       setFormData(prev => ({
  //         ...prev,
  //         location: '',
  //         location_coordinates: null,
  //       }));
  //     }
  //   },
  // });
  // Separate tags by type
  const serviceOptions = tagOptions.filter(tag => tag.type === 'SERVICE');
  const skillOptions = tagOptions.filter(tag => tag.type === 'SKILL');
  const currentSection = sections.find(s => s.id === activeSection);

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
              <TextField
                fullWidth
                label="Business Name"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Instagram Handle"
                helperText="e.g., @yourhandle"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
// =======
//               <LocationAutocomplete
//                 inputValue={locationForm.locationInputValue}
//                 onInputChange={locationForm.handleLocationInputChange}
//                 onDebouncedChange={locationForm.handleLocationDebouncedChange}
//                 selectedLocation={locationForm.selectedLocation}
//                 onSelect={locationForm.handleSelectLocation}
//                 results={locationForm.combinedLocationResults}
//                 loading={locationForm.isLoading}
//                 placeholder="Select your primary city location"
// >>>>>>> Stashed changes
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Google Maps Place Link"
                value={formData.google_maps_place}
                onChange={(e) => setFormData({ ...formData, google_maps_place: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <FormControl>
                <FormLabel>Travels Worldwide</FormLabel>
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
                      <TextField
                        fullWidth
                        label="Bridal Hair Price"
                        type="number"
                        placeholder="$"
                        value={formData.bridal_hair_price || ''}
                        onChange={(e) => setFormData({ ...formData, bridal_hair_price: e.target.value ? Number(e.target.value) : null })}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Bridesmaid Hair Price"
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
                      <TextField
                        fullWidth
                        label="Bridal Makeup Price"
                        type="number"
                        placeholder="$"
                        value={formData.bridal_makeup_price || ''}
                        onChange={(e) => setFormData({ ...formData, bridal_makeup_price: e.target.value ? Number(e.target.value) : null })}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Bridesmaid Makeup Price"
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
                      <TextField
                        fullWidth
                        label="Bridal Hair & Makeup Price"
                        type="number"
                        placeholder="$"
                        value={formData.bridal_hair_makeup_price || ''}
                        onChange={(e) => setFormData({ ...formData, bridal_hair_makeup_price: e.target.value ? Number(e.target.value) : null })}
                      />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Bridesmaid Hair & Makeup Price"
                        type="number"
                        placeholder="$"
                        value={formData.bridesmaid_hair_makeup_price || ''}
                        onChange={(e) => setFormData({ ...formData, bridesmaid_hair_makeup_price: e.target.value ? Number(e.target.value) : null })}
                      />
                    </Grid>
                  </>
                )}
              </>;
            })()}
          </Grid>
        )}

        {activeSection === 'about' && (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Tell clients about yourself"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={getDefaultBio({ businessName: formData.business_name, tags: formData.tags, location: formData.location })}
// =======
//               placeholder={getDefaultBio({ businessName: formData.business_name, tags: formData.tags, location: formData.locationResult.display_name })}
// >>>>>>> Stashed changes
            />
          </Box>
        )}

        {activeSection === 'image' && (
          <Box>
            <Typography variant="body1" color="text.primary" gutterBottom>
              Upload a photo to showcase your work
            </Typography>
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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select the services you offer (at least one required)
            </Typography>
            <TagSelector
              value={formData.tags.filter(tag => tag.type === 'SERVICE')}
              onChange={(serviceTags) => {
                // Merge with existing skills
                const skillTags = formData.tags.filter(tag => tag.type === 'SKILL');
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, mb: 2 }}>
              Select any skills you offer (optional)
            </Typography>
            <TagSelector
              value={formData.tags.filter(tag => tag.type === 'SKILL')}
              onChange={(skillTags) => {
                // Merge with existing services, remove any skills not selected
                const serviceTags = formData.tags.filter(tag => tag.type === 'SERVICE');
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
          </Box>
        )}
      </Box>

      {/* Footer with save button */}
      <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => {
            handleSave();
            markSectionComplete(activeSection!);
          }}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}
