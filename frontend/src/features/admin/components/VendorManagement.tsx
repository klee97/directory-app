'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { createVendor } from '../api/createVendor';
import toast from 'react-hot-toast';
import RegionSelector, { RegionOption } from './RegionSelector';

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
  specialization: string
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
  specialization: ''
} as const;

const AdminVendorManagement = () => {
  const [newVendor, setNewVendor] = useState<VendorInput>(VENDOR_INPUT_DEFAULT);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<RegionOption | null>(null);

  const addVendor = async () => {
    const loadingToast = toast.loading("Creating vendor...");

    try {
      const newVendorData = JSON.parse(JSON.stringify(newVendor));
      const data = await createVendor(newVendorData, firstName, lastName);

      // Dismiss loading toast regardless of the result
      toast.dismiss(loadingToast);

      if (data) {
        toast.success("Vendor added successfully!");
        setNewVendor(VENDOR_INPUT_DEFAULT);
        setFirstName("");
        setLastName("");
        setSelectedRegion(null);
      } else {
        toast.error("Failed to add vendor. Please try again.");
      }
    } catch (error) {
      toast.dismiss(loadingToast);

      // Show error message
      toast.error(
        error instanceof Error
          ? `Error: ${error.message}`
          : "An unexpected error occurred. Please try again."
      );

      console.error("Error adding vendor:", error);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof VendorInput) => {
    const value = e.target.value;
    const numberValue = value === '' ? null : Number(value);
    setNewVendor({ ...newVendor, [field]: numberValue, lists_prices: numberValue !== null });
  };

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
                onChange={(newRegion: RegionOption | null) => setSelectedRegion(newRegion)}
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
                value={newVendor.travels_world_wide.toString()}
                onChange={(e) => setNewVendor({ ...newVendor, travels_world_wide: Boolean(e.target.value) })}
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
          <FormControl fullWidth>
            <InputLabel id="specialization-select-label">Specialization</InputLabel>
            <Select
              labelId="specialization-select-label"
              id="specialization-select"
              value={newVendor.specialization ?? ""}
              label="Specialization"
              onChange={(e) => setNewVendor({ ...newVendor, specialization: e.target.value })}
            >
              <MenuItem value="Hair">Hair</MenuItem>
              <MenuItem value="Makeup">Makeup</MenuItem>
              <MenuItem value="Hair, Makeup">Hair & Makeup</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={addVendor}
            fullWidth
          >
            Add Vendor
          </Button>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminVendorManagement;