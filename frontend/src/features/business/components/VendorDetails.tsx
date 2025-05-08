'use client';

import { useRef, useState, useEffect } from 'react';
import { Vendor } from '@/types/vendor';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Grid from '@mui/system/Grid';
import Public from '@mui/icons-material/Public';
import LocationOn from '@mui/icons-material/LocationOn';
import Mail from '@mui/icons-material/Mail';
import Link from '@mui/icons-material/Link';
import Instagram from '@mui/icons-material/Instagram';
import Place from '@mui/icons-material/Place';
import { Vendor } from '@/types/vendor';
import { getFavoriteVendorIds } from '@/features/favorites/api/getUserFavorites';
import { createClient } from '@/lib/supabase/client';
import FavoriteButton from '@/features/favorites/components/FavoriteButton';


const StickyCard = styled(Card)(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(2),
}));

interface VendorDetailsProps {
  vendor: Vendor;
}

const DEFAULT_PRICE = "Contact for Pricing";

export function VendorDetails({ vendor }: VendorDetailsProps) {
  const startTime = useRef<number | null>(null);
  const theme = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    startTime.current = performance.now();
  
    return () => {
      if (startTime.current !== null) {
        const endTime = performance.now();
        const durationSeconds = ((endTime - startTime.current) / 1000).toFixed(2);
  
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'profile_view_duration',
          vendorSlug: vendor.slug,
          duration: durationSeconds,
        });
      }
    };
  }, []);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const favoriteVendorIds = await getFavoriteVendorIds();
        setIsFavorite(favoriteVendorIds.includes(vendor.id));  // Update with the backend status
      }
    };

    fetchFavoriteStatus();

    // Listen for session changes (e.g., when logging out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsFavorite(false);
      }
    });

    // Cleanup the subscription when the component unmounts
    return () => {
      subscription?.unsubscribe();
    };
  }, [vendor.id, supabase.auth]);

  return (
    <>
      <Box data-has-photo={!!vendor.cover_image}>
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
                      objectFit: 'cover', // Ensures it doesn't stretch
                    }}
                  />
                </Card>
              </Grid>
            )}

            {/* Vendor Info */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h2" component="h1" sx={{ fontFamily: 'serif' }}>
                  {vendor.business_name}
                </Typography>
                {/* Favorite Button */}
                {(process.env.NEXT_PUBLIC_FEATURE_FAVORITES_ENABLED === 'true') && (
                  <FavoriteButton
                    vendorId={vendor.id}
                    initialIsFavorited={isFavorite}
                  />
                )}
              </Box>
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
                      Get in Touch
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
    </>
  );
}
