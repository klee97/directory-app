import { Vendor } from '@/types/vendor';
import { PaperPropsVariantOverrides } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { OverridableStringUnion } from '@mui/types';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import defaultImage from '@/assets/default.jpeg';

export const VendorCard = ({
  vendor,
  variant,
  onFocus,
  onBlur,
  tabIndex,
  className,
}: {
  vendor: Vendor;
  variant: OverridableStringUnion<'elevation' | 'outlined', PaperPropsVariantOverrides>
  onFocus: () => void;
  onBlur: () => void;
  tabIndex: number;
  className: string;
}) => {
  return (
    <Card
      variant={variant}
      onFocus={onFocus}
      onBlur={onBlur}
      tabIndex={tabIndex}
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'background.paper',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
          cursor: 'pointer',
        },
        '&:focus-visible': {
          outline: '3px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          src={vendor.cover_image ?? defaultImage.src}
          alt={`${vendor.business_name} preview`}
          sx={{
            aspectRatio: '16 / 9',
            // objectFit: 'contain',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        />
        {/* Price Badge */}
        {vendor['bridal_hair_&_makeup_price'] && (
          <Chip
            label={`From $${vendor['bridal_hair_&_makeup_price']}`}
            sx={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              backgroundColor: 'white',
              fontWeight: 'medium',
            }}
          />
        )}
      </Box>
      
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 3,
          flexGrow: 1,
          '&:last-child': { pb: 3 },
        }}
      >
        {/* Business Name */}
        <Typography 
          variant="h6" 
          component="div"
          sx={{ 
            fontWeight: 'medium',
            mb: 1
          }}
        >
          {vendor.business_name}
        </Typography>

        {/* Specialty */}
        {vendor.specialization && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {vendor.specialization}
          </Typography>
        )}

        {/* Location Tags */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            icon={<LocationOnIcon />}
            label={vendor.region}
            size="small"
            sx={{ borderRadius: '4px' }}
          />
          {vendor.travels_world_wide === 'Yes' && (
            <Chip
              icon={<PublicIcon />}
              label="Travels Worldwide"
              size="small"
              sx={{ borderRadius: '4px' }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};