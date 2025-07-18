'use client';

import { useState } from 'react';
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
import { updateVendor } from '../api/updateVendor';
import { useNotification } from '@/contexts/NotificationContext';
import RegionSelector, { RegionOption } from './RegionSelector';
import TagSelector, { TagOption } from './TagSelector';
import Link from 'next/link';

// Define types directly in the file
export interface UpdateVendorInput {
  id: string,
  business_name: string | null,
  website: string | null,
  region: string | null,
  location_coordinates: string | null,
  travels_world_wide: boolean | null,
  lists_prices: boolean | null,
  email: string | null,
  ig_handle: string | null,
  bridal_hair_price: number | null,
  bridal_makeup_price: number | null,
  "bridal_hair_&_makeup_price": number | null,
  bridesmaid_hair_price: number | null,
  bridesmaid_makeup_price: number | null,
  "bridesmaid_hair_&_makeup_price": number | null,
  google_maps_place: string | null,
  tags: TagOption[],
}

export const UPDATE_VENDOR_INPUT_DEFAULT: UpdateVendorInput = {
  id: 'HMUA-',
  business_name: null,
  website: null,
  region: null,
  location_coordinates: null,
  travels_world_wide: null,
  lists_prices: null,
  email: null,
  ig_handle: null,
  bridal_hair_price: null,
  bridal_makeup_price: null,
  "bridal_hair_&_makeup_price": null,
  bridesmaid_hair_price: null,
  bridesmaid_makeup_price: null,
  "bridesmaid_hair_&_makeup_price": null,
  google_maps_place: null,
  tags: [],
} as const;

export const AdminUpdateVendorManagement = () => {
  const { addNotification } = useNotification();
  const [newVendor, setNewVendor] = useState<UpdateVendorInput>(UPDATE_VENDOR_INPUT_DEFAULT);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionOption | null>(null);
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to handle text field changes - prevents empty strings
  const handleTextFieldChange = (value: string, field: keyof UpdateVendorInput) => {
    const trimmedValue = value.trim();
    setNewVendor({ 
      ...newVendor, 
      [field]: trimmedValue === '' ? null : value // Store new value if not empty after trim
    });
  };

  const updateExistingVendor = async () => {
    setIsSubmitting(true);

    try {
      const newVendorData = JSON.parse(JSON.stringify(newVendor));
      const data = await updateVendor(newVendorData, firstName, lastName, selectedTags);

      if (data) {
        addNotification("Vendor updated successfully!");
        // Reset all form fields
        setNewVendor(UPDATE_VENDOR_INPUT_DEFAULT);
        setFirstName(null);
        setLastName(null);
        setSelectedRegion(null);
        setSelectedTags([]);
      } else {
        addNotification("Failed to add vendor. Please try again.", "error");
      }
    } catch (error) {
      addNotification(
        error instanceof Error
          ? `Error: ${error.message}`
          : "An unexpected error occurred. Please try again.",
        "error"
      );
      console.error("Error adding vendor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof UpdateVendorInput) => {
    const value = e.target.value.trim();
    const numberValue = value === '' ? null : Number(value);
    setNewVendor({ ...newVendor, [field]: numberValue, lists_prices: numberValue !== null });
  };

  const handleRegionChange = (value: RegionOption | null) => {
    setSelectedRegion(value);
    setNewVendor({ ...newVendor, region: value?.unique_region ?? value?.inputValue ?? null });
  };

  const handleTagChange = (value: TagOption[]) => {
    setSelectedTags(value);
    setNewVendor({ ...newVendor, tags: value });
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
        <Grid container spacing={3}>
          <TextField
            required
            label="Vendor ID"
            helperText="HMUA-123"
            variant="outlined"
            value={newVendor.id ?? ''}
            onChange={(e) => handleTextFieldChange(e.target.value, 'id')}
          />
          <TextField
            fullWidth
            label="Vendor Business Name"
            variant="outlined"
            value={newVendor.business_name ?? ''}
            onChange={(e) => handleTextFieldChange(e.target.value, 'business_name')}
          />
          <Grid container spacing={3} columns={3}>
            <TextField
              label="Website"
              variant="outlined"
              value={newVendor.website ?? ''}
              onChange={(e) => handleTextFieldChange(e.target.value, 'website')}
            />
            <TextField
              label="Email"
              variant="outlined"
              value={newVendor.email ?? ''}
              onChange={(e) => handleTextFieldChange(e.target.value, 'email')}
            />
            <TextField
              label="Instagram Handle"
              helperText="e.g., @yourhandle"
              variant="outlined"
              value={newVendor.ig_handle ?? ''}
              onChange={(e) => handleTextFieldChange(e.target.value, 'ig_handle')}
            />
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
                onChange={(selectedTags: TagOption[]) => handleTagChange(selectedTags)}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Location Coordinates"
                helperText="Format: LAT, LONG in numerical, not cardinal (e.g., '37.7749, -122.4194')"
                variant="outlined"
                value={newVendor.location_coordinates ?? ''}
                onChange={(e) => handleTextFieldChange(e.target.value, 'location_coordinates')}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <FormControl>
              <FormLabel id="demo-controlled-radio-buttons-group">Travels Worldwide</FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={newVendor.travels_world_wide === null ? 'null' : String(newVendor.travels_world_wide)}
                onChange={(e) => setNewVendor({ ...newVendor, travels_world_wide: parseBooleanString(e.target.value) })}
              >
                <FormControlLabel value="true" control={<Radio />} label="True" />
                <FormControlLabel value="false" control={<Radio />} label="False" />
                <FormControlLabel value="null" control={<Radio />} label="No Change" />
              </RadioGroup>
            </FormControl>
            <TextField
              fullWidth
              label="Google Maps Place link"
              variant="outlined"
              value={newVendor.google_maps_place ?? ''}
              onChange={(e) => handleTextFieldChange(e.target.value, 'google_maps_place')}
            />
          </Grid>
          <Grid container spacing={3}>

            <TextField
              label="Bridal Hair Price"
              variant="outlined"
              value={newVendor.bridal_hair_price ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridal_hair_price')}
            />
            <TextField
              label="Bridal Makeup Price"
              variant="outlined"
              value={newVendor.bridal_makeup_price ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridal_makeup_price')}
            />
            <TextField
              label="Bridal Hair & Makeup Price"
              variant="outlined"
              value={newVendor["bridal_hair_&_makeup_price"] ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridal_hair_&_makeup_price')}
            />
          </Grid>

          <Grid container spacing={3}>
            <TextField
              label="Bridesmaid Hair Price"
              variant="outlined"
              value={newVendor.bridesmaid_hair_price ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridesmaid_hair_price')}
            />
            <TextField
              label="Bridesmaid Makeup Price"
              variant="outlined"
              value={newVendor.bridesmaid_makeup_price ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridesmaid_makeup_price')}
            />
            <TextField
              label="Bridesmaid Hair & Makeup Price"
              variant="outlined"
              value={newVendor["bridesmaid_hair_&_makeup_price"] ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(e, 'bridesmaid_hair_&_makeup_price')}
            />
          </Grid>
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
        </Grid>
      </Box>
    </Container>
  );
};