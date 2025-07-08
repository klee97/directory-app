'use client';

import { useRef, useState, useEffect } from 'react';
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
import Send from '@mui/icons-material/Send';
import Link from '@mui/icons-material/Link';
import Instagram from '@mui/icons-material/Instagram';
import Place from '@mui/icons-material/Place';
import { Vendor } from '@/types/vendor';
import { getFavoriteVendorIds } from '@/features/favorites/api/getUserFavorites';
import { createClient } from '@/lib/supabase/client';
import FavoriteButton from '@/features/favorites/components/FavoriteButton';
import { VendorSpecialty } from '@/types/tag';
import { VendorCarousel } from '@/components/layouts/VendorCarousel';
import { Divider } from '@mui/material';
import { getLocationString } from '@/lib/location/displayLocation';
import { PhotoCarousel } from '@/components/layouts/PhotoCarousel';


const StickyCard = styled(Card)(({ theme }) => ({
  top: theme.spacing(2),
}));

const ContactCard = ({ vendor, isFavorite }: { vendor: Vendor, isFavorite: boolean }) => {
  const contactText = "Get a quote"
  return (<StickyCard elevation={0} >
    <CardContent >
      <Typography variant="h5" component="h2" sx={{
        mt: 2,
        mb: 2,
        textAlign: 'center'
      }}>
        Love their work?
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 2, alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
        {vendor.email && (
          <Button
            variant="contained"
            startIcon={<Mail />}
            sx={{ borderRadius: 6, paddingY: 1 }}
            href={`mailto:${vendor.email}`}
          >
            {contactText}
          </Button>
        )}
        {!vendor.email && vendor.instagram && (
          <Button
            variant="contained"
            startIcon={<Send />}
            sx={{ borderRadius: 6, paddingY: 1 }}
            href={`https://ig.me/m/${vendor.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {contactText}
          </Button>
        )}
        {/* Favorite Button */}
        <FavoriteButton
          vendorId={vendor.id}
          initialIsFavorited={isFavorite}
          sx={{ borderColor: 'primary.main', borderWidth: 1, borderStyle: 'solid' }}
        />
      </Box>
    </CardContent>
  </StickyCard>
  )
}

interface VendorDetailsProps {
  vendor: Vendor;
  nearbyVendors?: Vendor[];
}

const DEFAULT_PRICE = "Contact for Pricing";

export function VendorDetails({ vendor, nearbyVendors }: VendorDetailsProps) {
  const startTime = useRef<number | null>(null);
  const theme = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWide, setIsWide] = useState(window.innerWidth > theme.breakpoints.values.md);
  const supabase = createClient();
  const tags = vendor.tags.filter((tag) => tag.is_visible);
  const showImageCarousel = vendor.is_premium && vendor.images.length > 1;
  const showProfileImage = vendor.is_premium && vendor.profile_image !== null;

  useEffect(() => {
    const handleResize = () => {
      setIsWide(window.innerWidth > theme.breakpoints.values.md);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [theme.breakpoints.values.md]);

  const resolvedLocation = getLocationString(vendor);

  const resolvedLowestPrice = Math.min(
    vendor.bridal_hair_makeup_price ?? Infinity,
    vendor.bridal_hair_price ?? Infinity,
    vendor.bridal_makeup_price ?? Infinity,
    vendor.bridesmaid_hair_makeup_price ?? Infinity,
    vendor.bridesmaid_hair_price ?? Infinity,
    vendor.bridesmaid_makeup_price ?? Infinity
  )

  const hasPricing = resolvedLowestPrice < Infinity;

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
          testimonialCount: vendor.testimonials.length,
          photoCount: vendor.cover_image ? 1 : 0,
        });
      }
    };
  }, [vendor.cover_image, vendor.slug, vendor.testimonials.length]);

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
        <Container maxWidth="lg">
          {showImageCarousel && (<PhotoCarousel
            photos={vendor.images}
          />
          )}
          {/* Main Content */}
          <Grid container flexDirection={{ xs: 'column-reverse', md: 'row' }} spacing={{ md: 4 }} >
            {/* Left Column - Details */}
            <Grid size={{ xs: 12, md: 8 }}>
              {/* Vendor Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h2" component="h1" >
                  {vendor.business_name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  {/* Location */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" />
                    <Typography variant="subtitle1">{resolvedLocation}</Typography>
                  </Box>
                  {vendor.travels_world_wide && (
                    <Chip
                      icon={<Public />}
                      label="Travels Worldwide"
                      size="small"
                    />
                  )}
                </Box>
                {hasPricing && (
                  <Typography variant="body1">
                    Prices starting at ${resolvedLowestPrice}
                  </Typography>
                )}
                {/* Specialty Tags */}
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  {tags.length > 0 &&
                    tags
                      .filter((tag) => tag.is_visible && tag.display_name !== null)
                      .sort((a, b) => a.display_name!.localeCompare(b.display_name!))
                      .map((tag) => (
                        <Chip
                          key={tag.id}
                          label={`${tag.display_name}`}
                          size="medium"
                          color={tag.style === 'primary' ? 'primary' : 'default'}
                          sx={{ paddingX: 1 }}
                        />
                      ))}
                </Box>
              </Box>
              <Divider sx={{ marginTop: 4, marginBottom: 4 }} />
              {/* About & Links Section */}
              <Box flexDirection={{ xs: 'column', sm: 'row' }} display='flex' gap={4}>
                {/* Profile Image */}
                {showProfileImage && (
                  <Card elevation={0}
                    sx={{
                      // center the image in the card
                      display: 'flex',
                      justifyContent: 'center',
                      borderRadius: 2, overflow: 'hidden', minWidth: 200, marginX: 'auto'
                    }}>
                    {/* Vendor Image */}
                    <Box
                      component="img"
                      src={vendor.profile_image ?? ''}
                      alt={vendor.business_name ?? ''}
                      maxHeight={{ xs: 400, sm: 300 }}
                      sx={{
                        display: 'block',
                        objectFit: 'cover',
                      }}
                    />
                  </Card>
                )}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    About
                  </Typography>
                  {/* Description */}
                  <Typography variant="body1" component="p" sx={{ mb: 2 }}>
                    {vendor.business_name} is a {vendor.specialties.has(VendorSpecialty.SPECIALTY_HAIR) ? 'hair' : ''}{vendor.specialties.size == 2 ? ' and ' : ' '}{vendor.specialties.has(VendorSpecialty.SPECIALTY_MAKEUP) ? 'makeup' : ''} artist
                    specializing in Asian features. They are based in {resolvedLocation?.toLowerCase()?.includes("area") ? 'the ' : ''} {resolvedLocation}.
                  </Typography>
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
                        href={`https://instagram.com/${vendor.instagram}`}
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
                </Box>
              </Box>
              {/* Contact Card */}
              {!isWide &&
                <>
                  <Divider sx={{ marginTop: 4, marginBottom: 4 }} />
                  <ContactCard vendor={vendor} isFavorite={isFavorite} />
                </>
              }
              <Divider sx={{ marginTop: 4, marginBottom: 4 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Pricing */}
                <Typography variant="h5" component="h2">
                  Pricing
                </Typography>
                <Paper elevation={0} sx={{ p: 4, }}>
                  {hasPricing && (
                    <Typography variant="body1" component="h3">
                      Please note, these are estimates only. Contact the artist directly for the most up-to-date information.
                    </Typography>
                  )}
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

                  {vendor.specialties.has(VendorSpecialty.SPECIALTY_HAIR) && (
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

                  {vendor.specialties.has(VendorSpecialty.SPECIALTY_MAKEUP) && (
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

                  {vendor.specialties.has(VendorSpecialty.SPECIALTY_HAIR) && (
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
                  {vendor.specialties.has(VendorSpecialty.SPECIALTY_MAKEUP) && (

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
              {/* Testimonials */}
              {vendor.testimonials && vendor.testimonials[0] && (
                <>
                  <Divider sx={{ marginTop: 4, marginBottom: 4 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                    <Typography variant="h5" component="h2">
                      Testimonials
                    </Typography>
                    <Paper elevation={0} sx={{ p: 4, }}>
                      <Typography variant="body1" component="h3">
                        {vendor.testimonials[0].review}
                      </Typography>
                      {(vendor.testimonials[0].author) &&
                        (<Typography variant="body1" component="h3" textAlign="right">
                          - {vendor.testimonials[0].author}
                        </Typography>)
                      }
                    </Paper>
                  </Box>
                </>
              )}
            </Grid>
            {/* Image & Contact Card */}
            <Grid size={{ xs: 12, md: 4 }} >
              {!showImageCarousel && vendor.cover_image && (
                <Card elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4, maxWidth: 600, marginX: 'auto' }}>
                  {/* Vendor Image */}
                  <Box
                    component="img"
                    src={vendor.cover_image}
                    alt={vendor.business_name ?? ''}
                    sx={{
                      display: 'block',
                      width: '100%',
                      height: 400,
                      objectFit: 'cover', // Ensures it doesn't stretch
                    }}
                  />
                </Card>
              )}
              {/* Right Column - Contact Card */}
              {isWide &&
                <ContactCard vendor={vendor} isFavorite={isFavorite} />
              }
            </Grid>
          </Grid>
          {nearbyVendors && nearbyVendors.length > 0 && (
            <Box>
              <Divider sx={{ mt: 20, mb: 4 }} />
              <VendorCarousel
                vendors={nearbyVendors}
                title={`More wedding makeup artists for Asian features near ${getLocationString(vendor)}`}>
              </VendorCarousel>
            </Box>
          )}
        </Container>
      </Box >
    </>
  );
}
