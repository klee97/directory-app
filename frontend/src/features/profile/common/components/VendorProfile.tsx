'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Grid from '@mui/system/Grid';
import PublicIcon from '@mui/icons-material/Public';
import LocationOn from '@mui/icons-material/LocationOn';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Link from '@mui/icons-material/Link';
import Instagram from '@mui/icons-material/Instagram';
import Place from '@mui/icons-material/Place';
import { Vendor } from '@/types/vendor';
import { getFavoriteVendorIds } from '@/features/favorites/api/getUserFavorites';
import { createClient } from '@/lib/supabase/client';
import FavoriteButton from '@/features/favorites/components/FavoriteButton';
import { hasTagByName, VendorSpecialty } from '@/types/tag';
import { VendorCarousel } from '@/components/layouts/VendorCarousel';
import { Divider } from '@mui/material';
import { PhotoCarousel } from '@/components/layouts/PhotoCarousel';
import { useSearchParams } from 'next/navigation';
import { LATITUDE_PARAM, LONGITUDE_PARAM, SEARCH_PARAM, SERVICE_PARAM, SKILL_PARAM, TRAVEL_PARAM } from '@/lib/constants';
import FilterChip from '@/components/ui/FilterChip';
import Image from 'next/image';
import LeadCaptureForm from '@/features/contact/components/LeadCaptureForm';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getTodaySeed, shuffleMediaWithSeed } from '@/lib/randomize';
import { getDefaultBio } from '../utils/bio';
import { getDisplayNameWithoutType } from '@/lib/location/locationNames';

const StickyCard = styled(Card)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    position: 'sticky',
    top: theme.spacing(2),
  },
}));

const ContactCard = ({ vendor, isFavorite }: { vendor: Vendor, isFavorite: boolean }) => {
  const [formOpen, setFormOpen] = useState(false);
  const serviceTags = vendor.tags.filter(tag => tag.type === 'SERVICE');
  const defaultLocation = getDisplayNameWithoutType(vendor.city, vendor.state, vendor.country);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        <Button
          variant="contained"
          sx={{ borderRadius: 6, paddingY: 1 }}
          onClick={() => setFormOpen(true)}
        >
          Get a Quote
        </Button>

        <Dialog
          open={formOpen}
          onClose={(event, reason) => {
            if (reason !== 'backdropClick') {
              setFormOpen(false);
            }
          }} maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogContent sx={{ p: 0 }}>
            <LeadCaptureForm
              onClose={() => setFormOpen(false)}
              vendor={{
                name: vendor.business_name ?? '',
                slug: vendor.slug ?? '',
                id: vendor.id,
                serviceTags: serviceTags,
                location: defaultLocation ?? '',
              }}
              isModal={true}
            />
          </DialogContent>
        </Dialog>

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

export default function VendorDetails({ vendor, nearbyVendors }: VendorDetailsProps) {
  const startTime = useRef<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const tags = vendor.tags.filter((tag) => tag.is_visible);
  const showImageCarousel = vendor.is_premium && vendor.images.length > 1;
  const showProfileImage = vendor.is_premium && vendor.profile_image !== null;
  const resolvedImageCount = showImageCarousel ? vendor.images.length : (vendor.cover_image ? 1 : 0);
  const { array: randomizedImageList } = shuffleMediaWithSeed(vendor.images, getTodaySeed() + vendor.slug);

  const searchParams = useSearchParams();
  const lat = searchParams?.get(LATITUDE_PARAM);
  const lon = searchParams?.get(LONGITUDE_PARAM);
  const travelsWorldwide = searchParams?.get(TRAVEL_PARAM) === "true";
  const selectedSkills = useMemo(() => searchParams?.getAll(SKILL_PARAM) || [], [searchParams]);
  const selectedServices = useMemo(() => searchParams?.getAll(SERVICE_PARAM) || [], [searchParams]);
  const searchQuery = searchParams?.get(SEARCH_PARAM);

  const theme = useTheme();
  const supabase = createClient();

  const resolvedLocation = getDisplayNameWithoutType(vendor.city, vendor.state, vendor.country);

  const resolvedLowestPrice = Math.min(
    vendor.bridal_hair_makeup_price ?? Infinity,
    vendor.bridal_hair_price ?? Infinity,
    vendor.bridal_makeup_price ?? Infinity,
    vendor.bridesmaid_hair_makeup_price ?? Infinity,
    vendor.bridesmaid_hair_price ?? Infinity,
    vendor.bridesmaid_makeup_price ?? Infinity
  )

  const hasPricing = resolvedLowestPrice < Infinity;

  const description = vendor.description
    ? vendor.description
    : getDefaultBio({
      businessName: vendor.business_name,
      tags: vendor.tags,
      location: resolvedLocation || '',
    });

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
          photoCount: resolvedImageCount,
          isPremium: vendor.is_premium,
        });
      }
    };
  }, [resolvedImageCount, vendor.cover_image, vendor.is_premium, vendor.slug, vendor.testimonials.length]);

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
            photos={randomizedImageList}
            vendorSlug={vendor.slug}
          />
          )}
          {/* Main Content */}
          <Grid container flexDirection={{ xs: 'column-reverse', md: 'row' }} spacing={{ md: 4 }} >
            {/* Left Column - Details */}
            <Grid size={{ xs: 12, md: 8 }} sx={{ order: { xs: 2, md: 1 } }}>
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
                  {vendor.travels_world_wide && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PublicIcon fontSize="small" />
                    <Typography variant="subtitle1">Travels Worldwide</Typography>
                  </Box>
                  }
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
                        <FilterChip
                          key={tag.id}
                          label={`${tag.display_name}`}
                          size="medium"
                          color={tag.style === 'primary' ? 'primary' : 'info'}
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
                    {description}
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

                  {hasTagByName(vendor.tags, VendorSpecialty.SPECIALTY_HAIR) && (
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

                  {hasTagByName(vendor.tags, VendorSpecialty.SPECIALTY_MAKEUP) && (
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

                  {hasTagByName(vendor.tags, VendorSpecialty.SPECIALTY_HAIR) && (
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
                  {hasTagByName(vendor.tags, VendorSpecialty.SPECIALTY_MAKEUP) && (

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
                      <Typography variant="body1" component="h3" sx={{ whiteSpace: 'pre-wrap' }}>
                        {vendor.testimonials[0].review?.replace(/\n/g, '\n\n')}
                      </Typography>
                      {(vendor.testimonials[0].author) &&
                        (<Typography variant="body1" component="h3" paddingTop={2} textAlign="right">
                          - {vendor.testimonials[0].author}
                        </Typography>)
                      }
                    </Paper>
                  </Box>
                </>
              )}
            </Grid>
            {/* Image & Contact Card */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 1, md: 2 } }}>
              {!showImageCarousel && vendor.cover_image && (
                <Card elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4, maxWidth: 600, marginX: 'auto' }}>
                  {/* Vendor Image */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: 400,
                      overflow: 'hidden'
                    }}
                  >
                    <Image
                      src={vendor.cover_image}
                      alt={vendor.business_name ?? ''}
                      fill
                      sizes="(max-width: 768px) 100vw, 600px"
                      style={{
                        objectFit: 'cover'
                      }}
                      quality={80}
                      priority={true}
                    />
                  </Box>
                </Card>
              )}
              <Divider
                sx={{
                  mt: 4,
                  mb: 4,
                  display: { xs: 'block', md: 'none' }, // show only when stacked
                }}
              />
              <ContactCard vendor={vendor} isFavorite={isFavorite} />
            </Grid>
          </Grid>
          {nearbyVendors && nearbyVendors.length > 0 && (
            <Box>
              <Divider sx={{ mt: 20, mb: 4 }} />
              <VendorCarousel
                vendors={nearbyVendors}
                title={`More wedding makeup artists for Asian features near ${resolvedLocation}`}
                filterContext={{
                  lat: lat ? parseFloat(lat) : null,
                  lon: lon ? parseFloat(lon) : null,
                  selectedSkills: selectedSkills,
                  selectedServices: selectedServices,
                  travelsWorldwide: travelsWorldwide,
                  searchQuery: searchQuery || null
                }}
              >
              </VendorCarousel>
            </Box>
          )}
        </Container >
      </Box >
    </>
  );
}
