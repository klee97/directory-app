import { Vendor } from '@/types/vendor';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LocationOnIconOutlined from '@mui/icons-material/LocationOnOutlined';
import PublicIcon from '@mui/icons-material/Public';
import defaultImage from '@/assets/placeholder_cover_img_heart.jpeg';

export const VendorCard = ({
  vendor,
  onFocus,
  onBlur,
  tabIndex,
  className,
}: {
  vendor: Vendor;
  onFocus: () => void;
  onBlur: () => void;
  tabIndex: number;
  className: string;
}) => {

  return (
    <Card
      elevation={1}
      onFocus={onFocus}
      onBlur={onBlur}
      tabIndex={tabIndex}
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
          cursor: 'pointer',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          src={vendor.cover_image ?? defaultImage.src}
          alt={`${vendor.business_name} preview`}
          sx={{
            height: 300, // Adjust as needed for uniform height
            width: '100%',
            objectFit: 'cover', // Ensures the image covers the space without stretching
            objectPosition: 'center', // Adjust to prioritize faces (try 'center' if needed)
          }}
        />
        {/* Price Badges Container */}
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
          p: 3,
          flexGrow: 1,
          '&:last-child': { pb: 3 },
        }}
      >
        {/* Business Name */}
        <Typography
          variant="h4"
          component="div"
        >
          {vendor.business_name}
        </Typography>
        <Typography
          variant="body1"
        >
          <LocationOnIconOutlined fontSize='small' color='primary' /> {vendor.metro ?? vendor.metro_region ?? vendor.state ?? vendor.region}
        </Typography>

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
        {/* Specialty Tags */}
        <Box sx={{ display: 'flex', justifyContent: 'left', mt: 'auto', gap: 1 }}>
          {Array.from(vendor.specialties).map((specialty, index) => {
            return (
              <Chip
                key={index}
                label={specialty}
                variant="outlined"
                sx={{ fontSize: '0.875rem', fontWeight: 'medium', mt: 2 }}
              />
            );
          })}
        </Box>

      </CardContent>
    </Card>
  );
};