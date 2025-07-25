import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { styled, useTheme } from '@mui/material/styles';

import { Navigation, Pagination } from 'swiper/modules';
import { ReactNode, useEffect, useState } from 'react';
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
  '.swiper-button-next.swiper-button-disabled': {
    opacity: 0,
  },
  '.swiper-button-prev.swiper-button-disabled': {
    opacity: 0,
  },
}));

const StyledSwiperCompact = styled(Swiper)(({ theme }) => ({
  width: '100%',
  height: '100%',
  '--swiper-navigation-size': '24px',
  '--swiper-navigation-color': theme.palette.background.default,
  '--swiper-pagination-color': theme.palette.background.default,
  '.swiper-button-next.swiper-button-disabled': {
    opacity: 0,
  },
  '.swiper-button-prev.swiper-button-disabled': {
    opacity: 0,
  },
}));

const StyledSwiperSlide = styled(SwiperSlide)(({ theme }) => ({
  width: 'auto',
  background: theme.palette.background.default,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxSizing: 'border-box',
}));

export const SwiperCarousel = ({ children, title, isCompact = false, vendorSlug, swiperIndex, setSwiperIndex }:
  CarouselProps & {
    vendorSlug: string | null;
    swiperIndex: number;
    setSwiperIndex: (index: number) => void;
  }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(isCompact)
  const theme = useTheme();
  const margin = isCompact ? 0 : 2; // Adjust margin for compact mode

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < theme.breakpoints.values.sm) {
        setIsSmallScreen(true);
      } else {
        setIsSmallScreen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [theme.breakpoints.values.sm]);

  const onRealIndexChange = (swiper: SwiperClass) => {
    setSwiperIndex(swiper.realIndex);

    if (vendorSlug && typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'photo_swipe',
        vendorSlug: vendorSlug,
        photoIndex: swiper.realIndex,
        isCompact: isCompact
      });
    }
  }

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
          slidesPerView={1}
          spaceBetween={10}
          navigation={true}
          pagination={{
            clickable: true,
          }}
          modules={[Navigation, Pagination]}
          className="mySwiper"
        >
          {children.map((child, index) => (
            <StyledSwiperSlide key={index} style={{ margin }}>
              {child}
            </StyledSwiperSlide>
          ))}
        </StyledSwiperCompact>
      )}
      {!isCompact && !isSmallScreen && (
        <StyledSwiper
          slidesPerView={'auto'}
          spaceBetween={10}
          navigation={true}
          pagination={{
            clickable: true,
          }}
          modules={[Navigation, Pagination]}
          className="mySwiper"
          initialSlide={swiperIndex}
          onRealIndexChange={onRealIndexChange}
        >
          {children.map((child, index) => (
            <StyledSwiperSlide key={index} style={{ margin }}>
              {child}
            </StyledSwiperSlide>
          ))}
        </StyledSwiper>
      )}
      {!isCompact && isSmallScreen && (
        <StyledSwiper
          slidesPerView={1}
          spaceBetween={10}
          navigation={true}
          pagination={{
            clickable: true,
          }}
          modules={[Navigation, Pagination]}
          className="mySwiper"
          initialSlide={swiperIndex}
          onRealIndexChange={(swiper) => setSwiperIndex(swiper.realIndex)}
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
