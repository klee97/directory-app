import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { styled } from '@mui/material/styles';

import './styles.css';

import { FreeMode, Navigation, Pagination } from 'swiper/modules';
import { ReactNode } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

type CarouselProps = {
  children: ReactNode[];
  title?: string;
  isCompact?: boolean; // Optional prop to control compact mode
};

const StyledSwiper = styled(Swiper)(({ theme }) => ({
  width: '100%',
  height: '100%',
  '--swiper-navigation-color': theme.palette.primary.main,
  '--swiper-pagination-color': theme.palette.primary.main,
}));

const StyledSwiperSlide = styled(SwiperSlide)(({ theme }) => ({
  background: theme.palette.background.default,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const StyledSwiperCompact = styled(Swiper)(({ theme }) => ({
  width: '100%',
  height: '100%',
  '--swiper-navigation-size': '24px',
  '--swiper-navigation-color': theme.palette.background.default,
  '--swiper-pagination-color': theme.palette.background.default,
}));

export const SwiperCarousel = ({ children, title, isCompact = false }: CarouselProps) => {
  const margin = isCompact ? 0 : 2; // Adjust margin for compact mode

  return (
    <Box sx={{
      paddingY: margin,
      position: 'relative',
    }} >
      {title && (
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      {isCompact && (
        <StyledSwiperCompact
          navigation={true}
          pagination={{
            clickable: true,
          }}
          modules={[FreeMode, Navigation, Pagination]}
          className="mySwiper"
        >
          {children.map((child, index) => (
            <StyledSwiperSlide key={index} style={{ margin }}>
              {child}
            </StyledSwiperSlide>
          ))}
        </StyledSwiperCompact>
      )}
      {!isCompact && (
        <StyledSwiper
          navigation={true}
          pagination={{
            clickable: true,
          }}
          modules={[FreeMode, Navigation, Pagination]}
          className="mySwiper"
        >
          {children.map((child, index) => (
            <StyledSwiperSlide key={index} style={{ margin }}>
              {child}
            </StyledSwiperSlide>
          ))}
        </StyledSwiper>
      )}
    </Box>
  );
}
