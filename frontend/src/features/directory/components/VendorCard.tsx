"use client";
import { VendorByDistance } from '@/types/vendor';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import PublicIcon from '@mui/icons-material/Public';
import { useTheme } from '@mui/material';
import PlaceholderImage from '@/assets/placeholder_cover_img.jpeg';
import PlaceholderImageGray from '@/assets/placeholder_cover_img_gray.jpeg';
import FavoriteButton from '@/features/favorites/components/FavoriteButton';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { CITY_ABBREVIATIONS, STATE_ABBREVIATIONS } from '@/types/location';
import Stack from '@mui/system/Stack';
import { SwiperCarousel } from '@/components/layouts/SwiperCarousel';
import { useRouter } from 'next/navigation';
import { FilterContext } from './filters/FilterContext';

function formatVendorLocation(vendor: VendorByDistance): string {
  const city = vendor.city ? CITY_ABBREVIATIONS[vendor.city] || vendor.city : null;
  const state = vendor.state ? STATE_ABBREVIATIONS[vendor.state] || vendor.state : null;
  const location = [city, state, vendor.country].filter(Boolean).join(', ');
  return location || 'Location not specified';
}

export const VendorCard = ({
  vendor,
  searchParams,
  onFocus,
  onBlur,
  positionIndex,
  tabIndex,
  className,
  isFavorite,
  showFavoriteButton = false,
  variant = 'default',
  filterContext
}: {
  vendor: VendorByDistance;
  searchParams: string;
  onFocus: () => void;
  onBlur: () => void;
  positionIndex: number;
  tabIndex: number;
  className: string;
  isFavorite?: boolean;
  showFavoriteButton?: boolean;
  variant?: 'default' | 'compact';
  filterContext?: FilterContext
}) => {
  const [swiperIndex, setSwiperIndex] = useState(0);
  const router = useRouter();

  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true, // Only fire once
  });

  const resolvedImageCount = vendor.is_premium ? vendor.images.length : (vendor.cover_image ? 1 : 0);

  useEffect(() => {
    if (inView) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'card_impression',
        vendorSlug: vendor.slug,
        position: positionIndex,
        hasPhoto: !!vendor.cover_image,
        variant: variant,
        isPremium: vendor.is_premium,
        photoCount: resolvedImageCount,
        searchQuery: filterContext?.searchQuery,
        selectedSkills: filterContext?.selectedSkills,
        travelsWorldwide: filterContext?.travelsWorldwide,
        selectedLocation: filterContext?.selectedLocationName,
      });
    }
  }, [inView, vendor.cover_image, vendor.slug, positionIndex, variant]);

  const theme = useTheme();
  const placeholderImage = (theme.palette.mode === 'light') ? PlaceholderImage : PlaceholderImageGray;
  const lowestServicePrice = Math.min(
    vendor.bridal_hair_price ?? Infinity,
    vendor.bridal_makeup_price ?? Infinity
  )

  const hasPricing = lowestServicePrice < Infinity;
  const showImageCarousel = vendor.is_premium && vendor.images.length > 1;

  const trackCardClick = () => {
    window.dataLayer?.push({
      event: 'vendor_card_click_v2',
      vendorSlug: vendor.slug,
      position: positionIndex,
      hasPhoto: !!vendor.cover_image,
      variant: variant,
      isPremium: vendor.is_premium,
      photoIndex: showImageCarousel ? swiperIndex : 0,
    });
  }
  return (
    <>
      <Card
        ref={ref}
        elevation={1}
        onFocus={onFocus}
        onBlur={onBlur}
        tabIndex={tabIndex}
        className={className}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          maxWidth: 600,
          marginX: 'auto',
          position: 'relative',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
            cursor: 'pointer',
          },
          zIndex: 0
        }}
      >
        {showImageCarousel && (
          <Box sx={{ position: 'relative', mb: 1 }}>

            <SwiperCarousel
              isCompact={true}
              vendorSlug={vendor.slug}
              onSlideClick={() => {
                trackCardClick();
                router.push(searchParams
                  ? `/vendors/${vendor.slug}?${searchParams}`
                  : `/vendors/${vendor.slug}`)
              }}
              swiperIndex={swiperIndex}
              setSwiperIndex={setSwiperIndex}
            >
              {vendor.images.map((image, index) => (
                <CardMedia
                  key={index}
                  component="img"
                  src={image}
                  alt={`${vendor.business_name} preview`}
                  sx={{
                    height: variant === 'compact' ? 180 : 300,
                    width: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    zIndex: 1
                  }}
                />
              ))}
            </SwiperCarousel>
          </Box>
        )}

        <Link
          key={vendor.slug}
          href={searchParams
            ? `/vendors/${vendor.slug}?${searchParams}`
            : `/vendors/${vendor.slug}`
          }
          passHref
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            textDecoration: 'none',
            color: 'inherit'
          }}
          data-has-photo={!!vendor.cover_image}
          data-position={positionIndex}
          data-is-premium={vendor.is_premium}
          data-photo-index={showImageCarousel ? swiperIndex : 0}
          data-variant={variant}
          onClick={() => {
            trackCardClick();
          }}
        >
          {!showImageCarousel && (
            <CardMedia
              component="img"
              src={vendor.cover_image ?? placeholderImage.src}
              alt={`${vendor.business_name} preview`}
              sx={{
                height: variant === 'compact' ? 180 : 300,
                width: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                zIndex: 1
              }}
            />

          )}
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              p: variant === 'compact' ? 1 : 3,
              flex: '1 1 auto',
              minHeight: 0,
              flexGrow: 1,
              '&:last-child': { pb: variant === 'compact' ? 2 : 3 },
            }}
          >
            {/* Business Name */}
            <Typography
              variant={variant === 'compact' ? "subtitle1" : "h4"}
              component="div"
            >
              {vendor.business_name}
            </Typography>

            {/* Location */}
            <Typography
              variant="subtitle2"
            >
              {formatVendorLocation(vendor)}
            </Typography>

            <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
              {/* Pricing */}
              {hasPricing && <Stack direction="row" alignItems="center" spacing={0.5}>
                <PaidOutlinedIcon fontSize='small' />
                <Typography
                  variant="body2"
                  fontWeight={'bold'}
                  noWrap
                >
                  Starts at ${lowestServicePrice}
                </Typography>
              </Stack>
              }

              {/* Worldwide travel */}
              {vendor.travels_world_wide && <Stack direction="row" alignItems="center" spacing={0.5}>
                <PublicIcon fontSize='small' />
                <Typography
                  variant="body2"
                  fontWeight={'bold'}
                  noWrap
                >
                  Travels Worldwide
                </Typography>
              </Stack>
              }

            </Stack>
            {/* Specialty Tags (e.g. makeup or hair) and Skill Tags */}
            {variant === 'default' && (
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'left',
                mt: 'auto',
                gap: 1,
              }}>
                {vendor.tags?.length > 0 && (vendor.tags
                  .filter((tag) => tag.is_visible && tag.display_name !== null)
                  .sort((a, b) => a.display_name!.localeCompare(b.display_name!))
                  .map((tag) =>
                    <Chip
                      key={tag.id}
                      label={`${tag.display_name}`}
                      variant="outlined"
                      sx={{ fontSize: '0.875rem', fontWeight: 'medium', mt: 1 }}
                      color={tag.style === 'primary' ? 'primary' : 'default'}
                    />
                  ))}
              </Box>
            )}
          </CardContent>
        </Link>
        {/* Favorite Button */}
        {showFavoriteButton && (
          <Box sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
          }}>
            <FavoriteButton
              vendorId={vendor.id}
              initialIsFavorited={isFavorite ?? false}
            />
          </Box>
        )}
      </Card >
    </>
  );
};
