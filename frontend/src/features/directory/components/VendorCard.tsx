"use client";
import { VendorByDistance } from '@/types/vendor';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LocationOnIconOutlined from '@mui/icons-material/LocationOnOutlined';
import PublicIcon from '@mui/icons-material/Public';
import { useTheme } from '@mui/material';
import PlaceholderImage from '@/assets/placeholder_cover_img.jpeg';
import PlaceholderImageGray from '@/assets/placeholder_cover_img_gray.jpeg';
import FavoriteButton from '@/features/favorites/components/FavoriteButton';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { CITY_ABBREVIATIONS, STATE_ABBREVIATIONS } from '@/types/location';
import Stack from '@mui/system/Stack';

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
}) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true, // Only fire once
  });

  useEffect(() => {
    if (inView) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'card_impression',
        vendorSlug: vendor.slug,
        position: positionIndex,
        hasPhoto: !!vendor.cover_image,
        variant: variant,
      });
    }
  }, [inView, vendor.cover_image, vendor.slug, positionIndex, variant]);

  const theme = useTheme();
  const placeholderImage = (theme.palette.mode === 'light') ? PlaceholderImage : PlaceholderImageGray;

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
        <Link
          key={vendor.slug}
          href={`/vendors/${vendor.slug}?${searchParams}`}
          passHref
          style={{ textDecoration: 'none', color: 'inherit' }}
          data-has-photo={!!vendor.cover_image}
          data-position={positionIndex}
        >
          <Box sx={{ position: 'relative', mb: 1 }}>
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
            {/* Price Container */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 1, // Adjust spacing between chips
                alignItems: 'flex-end',
              }}
            >
              {vendor.bridal_hair_price && (
                <Chip
                  label={`✂️ from $${vendor.bridal_hair_price}`}
                  sx={{
                    backgroundColor: 'background.paper',
                    fontWeight: 'medium',
                    textAlign: 'right',
                  }}
                />
              )}
              {vendor.bridal_makeup_price && (
                <Chip
                  label={`💄 from $${vendor.bridal_makeup_price}`}
                  sx={{
                    backgroundColor: 'background.paper',
                    fontWeight: 'medium',
                    textAlign: 'right'
                  }}
                />
              )}
            </Box>
          </Box>
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              p: variant === 'compact' ? 1 : 3,
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
            <Stack direction="row" alignItems="top" spacing={0.5}>
              <LocationOnIconOutlined fontSize='small' color='primary' />
              <Typography
                variant={variant === 'compact' ? "subtitle2" : "subtitle1"}
              >
                {formatVendorLocation(vendor)}
              </Typography>

            </Stack>

            {/* Location Tags */}
            {vendor.travels_world_wide && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip
                  icon={<PublicIcon color='primary' />}
                  label="Travels Worldwide"
                  size="small"
                />
              </Box>
            )}
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
        {(process.env.NEXT_PUBLIC_FEATURE_FAVORITES_ENABLED === 'true' && showFavoriteButton) && (
          <Box sx={{
            position: 'absolute',
            top: 8,
            right: 8,
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
