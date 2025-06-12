'use client';

import { VendorByDistance } from '@/types/vendor';
import { VendorCard } from '@/features/directory/components/VendorCard';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';

export const VendorCarousel = ({
  vendors,
  title,
}: {
  vendors: VendorByDistance[];
  title?: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  const theme = useTheme();
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateFade = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      console.log('Scroll Left:', scrollLeft, 'Scroll Width:', scrollWidth, 'Client Width:', clientWidth);
      setShowLeftFade(scrollLeft > 50);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 1);
    };

    el.addEventListener("scroll", updateFade);
    updateFade();

    return () => el.removeEventListener("scroll", updateFade);
  }, []);
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <Box sx={{ mt: 4, position: 'relative' }}>
      {title && (
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ position: 'relative' }}>
        {showLeftFade && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 40,
              background: `linear-gradient(to right, ${theme.palette.background.default} 50%, transparent)`,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        )}
        {showRightFade && (
          <Box
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 40,
              background: `linear-gradient(to left, ${theme.palette.background.default} 50%, transparent)`,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        )}
        <Box
          ref={scrollRef}
          sx={{
            overflowX: 'auto',
            display: 'flex',
            gap: 2,
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            px: 2,
          }}
        ></Box>

        <Box sx={{ position: 'relative' }}>
          {/* Left Arrow */}
          {!!showLeftFade && <IconButton
            onClick={() => scroll('left')}
            sx={{
              position: 'absolute',
              top: '50%',
              left: -20, // Move it outside the scroll box
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'background.paper',
              boxShadow: 2,
              pointerEvents: 'auto', // ensure clickable
            }}
            aria-label="Scroll left"
          >
            <ChevronLeftIcon />
          </IconButton>
          }

          {/* Right Arrow */}
          {!!showRightFade && <IconButton
            onClick={() => scroll('right')}
            sx={{
              position: 'absolute',
              top: '50%',
              right: -20,
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'background.paper',
              boxShadow: 2,
              pointerEvents: 'auto',
            }}
            aria-label="Scroll right"
          >
            <ChevronRightIcon />
          </IconButton>
          }

          {/* Carousel Scroll Container */}
          <Box
            ref={scrollRef}
            sx={{
              display: 'flex',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              gap: 2,
              py: 1,
              px: 6,
              scrollPaddingX: '1rem',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {vendors.map((vendor, index) => (
              <Box
                key={vendor.id}
                sx={{
                  flex: '0 0 auto',
                  width: { xs: 220, sm: 240 },
                  scrollSnapAlign: 'start',
                }}
              >
                <VendorCard
                  vendor={vendor}
                  searchParams=""
                  onFocus={() => { }}
                  onBlur={() => { }}
                  positionIndex={index}
                  tabIndex={0}
                  className=""
                  showFavoriteButton={false}
                  isFavorite={false}
                  variant="compact"
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>

  );
};
