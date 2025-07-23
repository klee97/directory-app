import { Carousel } from './Carousel';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';

export const PhotoCarousel = ({ photos }: { photos: string[] }) => {
  return (
    <Carousel>
      {photos.map((photo, index) => (
        <Box
          key={index}
          sx={{
            flex: '0 0 auto',
            scrollSnapAlign: 'start',
          }}
        >
          <CardMedia
            component="img"
            src={photo}
            alt={`Photo ${index + 1}`}
            sx={{
              borderRadius: 2,
              maxWidth: { sm: 600 },
              width: '100%',
              height: { xs: 300, sm: 400 },
              objectFit: 'cover',
              overflow: 'hidden',
              marginX: 'auto',
            }}
          >
          </CardMedia>
        </Box>
      ))}
    </Carousel>
  );
};
