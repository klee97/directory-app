// components/VendorDetails.tsx
'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Vendor } from '@/types/vendor';

interface VendorDetailsProps {
  vendor: Vendor;
}

export function VendorDetails({ vendor }: VendorDetailsProps) {
  return (
    <Box sx={{ mt: 4 }}>
      {/* Vendor Header */}
      <Typography variant="h3" gutterBottom>
        {vendor.business_name}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {vendor.region}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Travels Worldwide: {vendor.travels_world_wide === 'Yes' ? '✅' : '❌'}
      </Typography>

      {/* Pricing Section */}
      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
        Pricing
      </Typography>
      <Typography variant="body1">
        {vendor['bridal_hair_&_makeup_price'] ? `$${vendor['bridal_hair_&_makeup_price']}` : 'Pricing upon request'}
      </Typography>

      {/* Services or Details
      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
        Services
      </Typography>
      <Typography variant="body1" gutterBottom>
        {vendor.services || 'No specific services listed'}
      </Typography> */}

      {/* Image Gallery */}
      {/* {vendor.images && vendor.images.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Gallery
          </Typography>
          <Grid container spacing={2}>
            {vendor.images.map((img: string, index: number) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Card>
                  <img
                    src={img}
                    alt={`Vendor ${vendor.name} - ${index + 1}`}
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )} */}

      {/* Contact CTA */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button variant="contained" color="primary" size="large">
          Contact {vendor.email}
        </Button>
      </Box>
    </Box>
  );
}
