'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  Card,
  CardContent,
  useTheme,
  styled,
} from '@mui/material';
import { Public, LocationOn, Mail, Link, Instagram, Place } from '@mui/icons-material';
import { Vendor } from '@/types/vendor';
import Grid from '@mui/system/Grid';
import FavoriteIcon from '@mui/icons-material/Favorite';

const StickyCard = styled(Card)(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(2),
}));

interface VendorDetailsProps {
  vendor: Vendor;
  isFavorite?: boolean;
}

const DEFAULT_PRICE = "Contact for Pricing";

export function VendorDetails({ vendor, isFavorite }: VendorDetailsProps) {
  const theme = useTheme();
  const handleFavoriteClick = () => {
    // Add code here to save the vendor to favorites
  };
  isFavorite = true;
  return (
    <Box>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container rowSpacing={4} columnSpacing={8}>
          {/* Image & Contact Card */}
          {vendor.cover_image && (
            <Grid size={{ xs: 8, md: 4 }}>
              <Card elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                {/* Vendor Image */}
                <Box
                  component="img"
                  src={vendor.cover_image}
                  alt={vendor.business_name ?? ''}
                  sx={{
                    display: 'block',
                    width: '100%',
                    height: 300,
                    objectFit: 'cover', // Ensures it doesn’t stretch
                  }}
                />
              </Card>
            </Grid>
          )}

          {/* Vendor Info */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h2" component="h1" sx={{ fontFamily: 'serif', mb: 2 }}>
              {vendor.business_name} {isFavorite ? (
              <FavoriteIcon
                color='primary'
              />
              ) : null}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" />
                <Typography variant="subtitle1">{vendor.metro ?? vendor.metro_region ?? vendor.state ?? vendor.region}</Typography>
              </Box>
              {vendor.travels_world_wide && (
                <Chip
                  icon={<Public />}
                  label="Travels Worldwide"
                  size="small"
                />
              )}
            </Box>
            <Box
              sx={{
                pt: 3,
                mt: 6,
                borderTop: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            />
            {/* Links Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {vendor.website && (
                <Button
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<Link />}
                  sx={{ textTransform: 'none' }}
                  color='secondary'
                >
                  Website
                </Button>
              )}
              {vendor.instagram && (
                <Button
                  href={vendor.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<Instagram />}
                  sx={{ textTransform: 'none' }}
                  color='secondary'
                >
                  Instagram
                </Button>
              )}
              {vendor.google_maps_place && (
                <Button
                  href={vendor.google_maps_place}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<Place />}
                  sx={{ textTransform: 'none' }}
                  color='secondary'
                >
                  Google Maps
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {/* Left Column - Details */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Services & Pricing */}
              <Paper elevation={0} sx={{ p: 4, }}>
                <Typography variant="h5" component="h2">
                  Services & Pricing
                </Typography>
                <Typography variant="body1" component="h3">
                  Please note, these are estimates only. Contact the artist directly for the most up-to-date information.
                </Typography>
                {vendor.bridal_hair_makeup_price && (
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Bridal Hair & Makeup
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      ${vendor.bridal_hair_makeup_price}
                    </Typography>
                  </Box>
                )}

                {vendor.specialties.has('Hair') && (
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Bridal Hair
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {vendor.bridal_hair_price
                        ? `$${vendor.bridal_hair_price}`
                        : DEFAULT_PRICE}
                    </Typography>
                  </Box>
                )}

                {vendor.specialties.has('Makeup') && (
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Bridal Makeup
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {vendor.bridal_makeup_price
                        ? `$${vendor.bridal_makeup_price}`
                        : DEFAULT_PRICE}
                    </Typography>
                  </Box>
                )}

                {vendor.bridesmaid_hair_makeup_price && (
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Bridesmaid Hair & Makeup
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      ${vendor.bridesmaid_hair_makeup_price}
                    </Typography>
                  </Box>
                )}

                {vendor.specialties.has('Hair') && (
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Bridesmaid Hair
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {vendor.bridesmaid_hair_price
                        ? `$${vendor.bridesmaid_hair_price}`
                        : DEFAULT_PRICE}
                    </Typography>
                  </Box>
                )}
                {vendor.specialties.has('Makeup') && (

                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 2,
                  }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Bridesmaid Makeup
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {vendor.bridesmaid_makeup_price
                        ? `$${vendor.bridesmaid_makeup_price}`
                        : DEFAULT_PRICE}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </Grid>

          {/* Right Column - Contact Card */}
          {vendor.email && (
            <Grid size={{ xs: 12, md: 4 }}>
              <StickyCard elevation={0} >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" component="h2" sx={{
                    mb: 3,
                    textAlign: 'center'
                  }}>
                    Love what you see?
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<Mail />}
                    sx={{ mb: 3 }}
                    href={`mailto:${vendor.email}`}
                  >
                    Contact Vendor
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<FavoriteIcon />}
                    sx={{ mb: 3 }}
                    onClick={handleFavoriteClick}
                  >
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Button>
                </CardContent>
              </StickyCard>
            </Grid>
          )}
          {/* Bottom - Testimonials */}
          {vendor.testimonials && vendor.testimonials[0] && (
            <Grid>
              <Paper elevation={0} sx={{ p: 4, }}>
                <Typography variant="h5" component="h2">
                  Testimonials
                </Typography>
                <br />
                <Typography variant="body1" component="h3">
                  {vendor.testimonials[0].review}
                </Typography>
                <Typography variant="body1" component="h3" textAlign="right">
                  - {vendor.testimonials[0].author}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box >
  );
}