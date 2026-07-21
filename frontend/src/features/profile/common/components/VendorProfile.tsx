'use client';

import { useRef, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import PublicIcon from '@mui/icons-material/Public';
import LocationOn from '@mui/icons-material/LocationOn';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Link from '@mui/icons-material/Link';
import Instagram from '@mui/icons-material/Instagram';
import Place from '@mui/icons-material/Place';
import { Vendor } from '@/types/vendor';
import { getFavoriteVendorIds } from '@/features/favorites/api/getUserFavorites';
import FavoriteButton from '@/features/favorites/components/FavoriteButton';
import { hasTagByName, VendorSpecialty } from '@/types/tag';
import { Divider } from '@mui/material';
import { PhotoCarousel } from '@/components/layouts/PhotoCarousel';
import FilterChip from '@/components/ui/FilterChip';
import LeadCaptureForm from '@/features/contact/components/LeadCaptureForm';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getTodaySeed, shuffleMediaWithSeed } from '@/lib/randomize';
import { getDisplayNameWithoutType } from '@/lib/location/locationNames';
import PlaceholderImage from '@/assets/placeholder_cover_img.jpeg';
import PlaceholderImageGray from '@/assets/placeholder_cover_img_gray.jpeg';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { VendorCoverImage } from './VendorCoverImage';
import { useAuth } from '@/contexts/AuthContext';
import { getInquiryState } from '../utils/getInquiryState';
import ManageProfilePrompt from '@/features/vendorClaim/components/ManageProfilePrompt';
import { maskEmail } from '@/utils/maskEmail';

const DEFAULT_PRICE = "Contact for Pricing";

const StickyCard = styled(Card)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    position: 'sticky',
    top: theme.spacing(2),
  },
}));

const ContactCard = ({ vendor, isFavorite }: { vendor: Vendor, isFavorite: boolean }) => {
  const [formOpen, setFormOpen] = useState(false);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const serviceTags = vendor.tags.filter(tag => tag.type === 'SERVICE');
  const defaultLocation = getDisplayNameWithoutType(vendor.city, vendor.state, vendor.country);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const inquiryState = getInquiryState(vendor.inquiries_opted_out_at, vendor.verified_at);

  return (
    <StickyCard elevation={0}>
      <CardContent>
        <Typography variant="h5" component="h2" sx={{
          mt: 2,
          mb: 2,
          textAlign: 'center'
        }}>
          Love their work?
        </Typography>
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          mb: 2,
          alignContent: 'center',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {inquiryState !== 'opted_out' && (
            <>
              <Button
                variant="contained"
                sx={{ borderRadius: 6, paddingY: 1 }}
                onClick={() => setFormOpen(true)}
              >
                {inquiryState === 'verified' ? 'Get a Quote' : 'Contact'}
              </Button>

              <Dialog
                open={formOpen}
                onClose={(event, reason) => {
                  if (reason !== 'backdropClick') {
                    setFormOpen(false);
                  }
                }}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
              >
                <DialogContent ref={dialogContentRef} sx={{ p: 0 }}>

                  <LeadCaptureForm
                    onClose={() => setFormOpen(false)}
                    onScrollToTop={() => dialogContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                    vendor={{
                      businessName: vendor.business_name ?? '',
                      slug: vendor.slug ?? '',
                      id: vendor.id,
                      serviceTags: serviceTags,
                      location: defaultLocation ?? '',
                    }}
                    isModal={true}
                    inquiryState={inquiryState}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}

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
  vendorDescription: string;
  children?: React.ReactNode;
}

export default function VendorDetails({ vendor, vendorDescription, children }: VendorDetailsProps) {
  const startTime = useRef<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const tags = vendor.tags.filter((tag) => tag.is_visible);
  const showImageCarousel = vendor.is_premium && vendor.images.length > 1;
  const showProfileImage = vendor.is_premium && vendor.profile_image !== null;
  const hasSidebarImage = !showImageCarousel && !!vendor.cover_image;
  const resolvedImageCount = showImageCarousel ? vendor.images.length : (vendor.cover_image ? 1 : 0);
  const { array: randomizedImageList } = shuffleMediaWithSeed(vendor.images, getTodaySeed() + vendor.slug);


  const allowlistIds = process.env.NEXT_PUBLIC_ALLOWLIST_VENDOR_SLUGS?.split(',') || [];
  const isAllowlisted = vendor.slug ? allowlistIds.includes(vendor.slug) : false;
  const isPaused = process.env.NEXT_PUBLIC_TRANSITION_ENABLED === 'true' && !isAllowlisted;

  const theme = useTheme();
  const { isLoggedIn } = useAuth();

  const placeholderImage = (theme.palette.mode === 'light') ? PlaceholderImage : PlaceholderImageGray;

  const resolvedLocation = getDisplayNameWithoutType(vendor.city, vendor.state, vendor.country);

  const prices = [
    vendor.bridal_hair_makeup_price,
    vendor.bridal_hair_price,
    vendor.bridal_makeup_price,
    vendor.bridesmaid_hair_makeup_price,
    vendor.bridesmaid_hair_price,
    vendor.bridesmaid_makeup_price
  ].filter((price): price is number => price !== null && price !== undefined && price > 0);

  const hasPricing = prices.length > 0;
  const resolvedLowestPrice = hasPricing ? Math.min(...prices) : 0;

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
  }, [resolvedImageCount, vendor.images, vendor.cover_image, vendor.is_premium, vendor.slug, vendor.testimonials.length]);


  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (isLoggedIn) {
        const favoriteVendorIds = await getFavoriteVendorIds();
        setIsFavorite(favoriteVendorIds.includes(vendor.id));
      } else {
        setIsFavorite(false); // handles sign-out
      }
    };

    fetchFavoriteStatus();
  }, [vendor.id, isLoggedIn]);

  return (
    <>
      <Box data-has-photo={!!vendor.cover_image}>
        <Container maxWidth="lg">
          {showImageCarousel && (<PhotoCarousel
            photos={randomizedImageList}
            vendorSlug={vendor.slug}
            placeholderImage={placeholderImage}
          />
          )}
          {/* Main Content */}
          {/*
            Instead of MUI Grid, we use CSS Grid with named areas to have more
            flexible layout depending on screen size.
            small screen stacks image -> details -> contact top to bottom;
            md+ places details in a full-height left column,
            with image stacked above
            contact in the right column.
          */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
              columnGap: { md: 4 },
              gridTemplateAreas: hasSidebarImage
                ? {
                  xs: `"image" "details" "contact"`,
                  md: `"details image" "details contact"`,
                }
                : {
                  xs: `"details" "contact"`,
                  md: `"details contact"`,
                },
            }}
          >
            {/* Cover Image */}
            {hasSidebarImage && (
              <Box sx={{ gridArea: 'image' }}>
                <VendorCoverImage
                  coverImage={vendor.cover_image!}
                  businessName={vendor.business_name}
                  placeholderImage={placeholderImage}
                />
              </Box>
            )}
            {/* Details */}
            <Box sx={{ gridArea: 'details' }}>
              {/* Vendor Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h2" component="h1">
                  {vendor.business_name}
                </Typography>
                {vendor.verified_at && <VerifiedBadge size={24} />}
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
                  <Typography variant="body1" component="p" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                    {vendorDescription}
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
              {!isPaused && vendor.testimonials && vendor.testimonials[0] && (
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
            </Box>
            {/* Contact */}
            <Box sx={{ gridArea: 'contact' }}>
              <Divider
                sx={{
                  mt: 4,
                  mb: 4,
                  display: { xs: 'block', md: 'none' }, // show only when stacked
                }}
              />
              <ContactCard vendor={vendor} isFavorite={isFavorite} />
            </Box>
          </Box>
          {/* Low-key ownership affordance. Claimed listings send the owner
              straight to login; unclaimed listings with an email on file open
              the claim-link flow. Shown regardless of the content-transition
              pause: managing a listing is independent of displayed content. */}
          {vendor.business_name && (vendor.verified_at || vendor.email) && (
            <ManageProfilePrompt
              slug={vendor.slug ?? ''}
              businessName={vendor.business_name}
              isClaimed={!!vendor.verified_at}
              emailHint={vendor.email ? maskEmail(vendor.email) : ''}
            />
          )}
          {children}
        </Container >
      </Box >
    </>
  );
}