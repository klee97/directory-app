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
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Checkbox from '@mui/material/Checkbox';
import { createVendor } from '@/features/profile/common/api/createVendor';
import { useNotification } from '@/contexts/NotificationContext';
import RegionSelector, { RegionOption } from '@/features/profile/common/components/RegionSelector';
import TagSelector from '@/features/profile/common/components/TagSelector';
import { useTags } from '@/features/profile/common/hooks/useTags';
import Link from 'next/link';
import { VendorTag } from '@/types/vendor';
import { shouldIncludeTestVendors } from '@/lib/env/env';
import { normalizeUrl } from '@/lib/profile/normalizeUrl';
import { normalizeInstagramHandle } from '@/lib/profile/normalizeInstagram';
import InputAdornment from '@mui/material/InputAdornment';

// Define types directly in the file
export interface CreateVendorInput {
  id?: string; // ✅ Optional ID for test vendors
  business_name: string,
  website: string,
  region: string,
  latitude: number | null,
  longitude: number | null,
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
  tags: VendorTag[] | null,
}

export const VENDOR_INPUT_DEFAULT: CreateVendorInput = {
  business_name: '',
  website: '',
  region: '',
  latitude: null,
  longitude: null,
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

export const AdminAddVendorManagement = () => {
  const { addNotification } = useNotification();
  const [newVendor, setNewVendor] = useState<CreateVendorInput>(VENDOR_INPUT_DEFAULT);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<RegionOption | null>(null);
  const [selectedTags, setSelectedTags] = useState<VendorTag[] | null>(null);
  const { tags } = useTags();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Test vendor state
  const [isTestVendor, setIsTestVendor] = useState(false);
  const [testVendorId, setTestVendorId] = useState('');

  const addVendor = async () => {
    setIsSubmitting(true);

    try {
      const newVendorData = JSON.parse(JSON.stringify(newVendor));

      // ✅ Add test vendor ID if creating a test vendor
      if (isTestVendor && testVendorId.trim()) {
        const id = testVendorId.trim().startsWith('TEST-')
          ? testVendorId.trim()
          : `TEST-${testVendorId.trim()}`;
        newVendorData.id = id;
      }

      const data = await createVendor(newVendorData, firstName, lastName, selectedTags);

      if (data) {
        addNotification(
          isTestVendor
            ? "Test vendor added successfully!"
            : "Vendor added successfully!"
        );
        setNewVendor(VENDOR_INPUT_DEFAULT);
        setFirstName("");
        setLastName("");
        setSelectedRegion(null);
        setSelectedTags([]);
        setIsTestVendor(false);
        setTestVendorId('');
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

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof CreateVendorInput) => {
    const value = e.target.value;
    const numberValue = value === '' ? null : Number(value);
    setNewVendor({ ...newVendor, [field]: numberValue, lists_prices: numberValue !== null });
  };

  const handleRegionChange = (value: RegionOption | null) => {
    setSelectedRegion(value);
    setNewVendor({ ...newVendor, region: value?.unique_region ?? value?.inputValue ?? '' });
  };

  const handleTagChange = (value: VendorTag[] | null) => {
    setSelectedTags(value);
    setNewVendor({ ...newVendor, tags: value });
  }

  // Helper function to handle number field changes
  const handleNumberFieldChange = (value: string, field: keyof CreateVendorInput) => {
    const trimmedValue = value.trim();
    const numberValue = trimmedValue === '' ? null : Number(trimmedValue);
    setNewVendor({
      ...newVendor,
      [field]: numberValue
    });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Instructions in <Link href="https://docs.google.com/document/d/1hHj-bi1kwWTgGTNnO1T5QSOj2YP6da9Vs5jf9I8xBe4">Google Doc</Link>
        </Typography>
        <br />

        {/* ✅ Test vendor section */}
        {shouldIncludeTestVendors() && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>Development Mode</AlertTitle>
              You can create test vendors that won&apos;t be visible in production and won&apos;t sync to HubSpot.
            </Alert>

            <FormControlLabel
              control={
                <Checkbox
                  checked={isTestVendor}
                  onChange={(e) => setIsTestVendor(e.target.checked)}
                />
              }
              label="Create as test vendor"
            />

            {isTestVendor && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Test Vendor ID"
                  helperText="Enter ID (e.g., '001' for 'TEST-001' or 'TEST-COMPLETE' for custom ID)"
                  value={testVendorId}
                  onChange={(e) => setTestVendorId(e.target.value)}
                  placeholder="001"
                  sx={{ mb: 2 }}
                />
                {testVendorId && (
                  <Typography variant="caption" color="text.secondary">
                    Will create vendor with ID: {testVendorId.trim().startsWith('TEST-') ? testVendorId.trim() : `TEST-${testVendorId.trim()}`}
                  </Typography>
                )}
              </Box>
            )}
            <Divider sx={{ mt: 2 }} />
          </Box>
        )}

        {/* Show warning if trying to create test vendor in production */}
        {!shouldIncludeTestVendors && isTestVendor && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Test vendors can only be created in development environment.
          </Alert>
        )}

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
              onChange={(e) => setNewVendor({ ...newVendor, website: normalizeUrl(e.target.value) })}
            />
            <TextField
              label="Email"
              variant="outlined"
              value={newVendor.email ?? ""}
              onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
            />
            <TextField
              required
              label="Instagram Handle"
              variant="outlined"
              value={newVendor.ig_handle ?? ""}
              onChange={(e) => setNewVendor({ ...newVendor, ig_handle: e.target.value })}
              onBlur={(e) => {
                const normalized = normalizeInstagramHandle(e.target.value);
                if (normalized !== e.target.value) {
                  setNewVendor({ ...newVendor, ig_handle: normalized });
                }
              }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">@</InputAdornment>
                }
              }}
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
                onChange={(selectedTags: VendorTag[] | null) => handleTagChange(selectedTags)}
                options={tags}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Latitude"
                helperText="Latitude in numerical, not cardinal, format (e.g. '37.7749')"
                variant="outlined"
                type="number"
                slotProps={{ htmlInput: { step: "any" } }}
                value={newVendor.latitude ?? ''}
                onChange={(e) => handleNumberFieldChange(e.target.value, 'latitude')}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Longitude"
                helperText="Longitude in numerical, not cardinal, format (e.g. '-122.4194')"
                variant="outlined"
                type="number"
                slotProps={{ htmlInput: { step: "any" } }}
                value={newVendor.longitude ?? ''}
                onChange={(e) => handleNumberFieldChange(e.target.value, 'longitude')}
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
            disabled={isSubmitting || (isTestVendor && !shouldIncludeTestVendors())}
          >
            {isTestVendor ? 'Add Test Vendor' : 'Add Vendor'}
          </Button>
        </Grid>
      </Box>
    </Container>
  );
};