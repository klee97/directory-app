import { Carousel } from './Carousel';
import Card from '@mui/material/Card';
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
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              marginX: 'auto',
            }}
          >
            <Box
              component="img"
              src={photo}
              alt={`Photo ${index + 1}`}
              sx={{
                maxWidth: 600,
                width: '100%',
                height: 400,
                objectFit: 'cover',
              }}
            />
          </Card>
        </Box>
      ))}
    </Carousel>
  );
};
