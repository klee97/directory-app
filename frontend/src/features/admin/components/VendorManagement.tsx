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
import { createVendor } from '../api/createVendor';
import { useNotification } from '@/contexts/NotificationContext';
import RegionSelector, { RegionOption } from './RegionSelector';
import TagSelector, { TagOption } from './TagSelector';

// Define types directly in the file
export interface VendorInput {
  business_name: string,
  website: string,
  region: string,
  location_coordinates: string,
  travels_world_wide: boolean,
  lists_prices: boolean,
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

export const VENDOR_INPUT_DEFAULT: VendorInput = {
  business_name: '',
  website: '',
  region: '',
  location_coordinates: '',
  travels_world_wide: false,
  lists_prices: false,
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

const AdminVendorManagement = () => {
  const { addNotification } = useNotification();
  const [newVendor, setNewVendor] = useState<VendorInput>(VENDOR_INPUT_DEFAULT);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<RegionOption | null>(null);
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addVendor = async () => {
    setIsSubmitting(true);

    try {
      const newVendorData = JSON.parse(JSON.stringify(newVendor));
      const data = await createVendor(newVendorData, firstName, lastName, selectedTags);

      if (data) {
        addNotification("Vendor added successfully!");
        setNewVendor(VENDOR_INPUT_DEFAULT);
        setFirstName("");
        setLastName("");
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

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof VendorInput) => {
    const value = e.target.value;
    const numberValue = value === '' ? null : Number(value);
    setNewVendor({ ...newVendor, [field]: numberValue, lists_prices: numberValue !== null });
  };

  const handleRegionChange = (value: RegionOption | null) => {
    setSelectedRegion(value);
    setNewVendor({ ...newVendor, region: value?.unique_region ?? value?.inputValue ?? '' });
  };

  const handleTagChange = (value: TagOption[]) => {
    setSelectedTags(value);
    setNewVendor({ ...newVendor, tags: value });
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Vendor
        </Typography>

        <Grid container spacing={3}>
          <TextField
            required
            fullWidth
            label="Vendor Business Name"
            variant="outlined"
            value={newVendor.business_name ?? ""}
            onChange={(e) => setNewVendor({ ...newVendor, business_name: e.target.value })}
          />
          <Grid container spacing={3} columns={3}>

            <TextField
              label="Website"
              variant="outlined"
              value={newVendor.website ?? ""}
              onChange={(e) => setNewVendor({ ...newVendor, website: e.target.value })}
            />
            <TextField
              label="Email"
              variant="outlined"
              value={newVendor.email ?? ""}
              onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
            />
            <TextField
              required
              label="Instagram Handle (with @)"
              variant="outlined"
              value={newVendor.ig_handle ?? ""}
              onChange={(e) => setNewVendor({ ...newVendor, ig_handle: e.target.value })}
            />
          </Grid>

          <Grid container spacing={3}>
            <Grid size={6}>
              <TextField
                fullWidth
                label="First Name"
                variant="outlined"
                value={firstName ?? ""}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Last Name"
                variant="outlined"
                value={lastName ?? ""}
                onChange={(e) => setLastName(e.target.value)}
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
                required
                fullWidth
                label="Location Coordinates"
                variant="outlined"
                value={newVendor.location_coordinates ?? ""}
                onChange={(e) => setNewVendor({ ...newVendor, location_coordinates: e.target.value })}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <FormControl>
              <FormLabel id="demo-controlled-radio-buttons-group">Travels Worldwide</FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={newVendor.travels_world_wide ? "true" : "false"}
                onChange={(e) => setNewVendor({ ...newVendor, travels_world_wide: e.target.value === "true" })}
              >
                <FormControlLabel value="true" control={<Radio />} label="True" />
                <FormControlLabel value="false" control={<Radio />} label="False" />
              </RadioGroup>
            </FormControl>
            <TextField
              fullWidth
              label="Google Maps Place link"
              variant="outlined"
              value={newVendor.google_maps_place ?? ""}
              onChange={(e) => setNewVendor({ ...newVendor, google_maps_place: e.target.value })}
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
            onClick={addVendor}
            fullWidth
            disabled={isSubmitting}
          >
            Add Vendor
          </Button>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminVendorManagement;