'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useEffect, useRef, useState, ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

type CarouselProps = {
  children: ReactNode;
  title?: string;
  isCompact?: boolean; // Optional prop to control compact mode
};

export const Carousel = ({ children, title, isCompact = false }: CarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);
  const [isNarrow, setIsNarrow] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkWidth = () => {
      setIsNarrow(el.clientWidth < theme.breakpoints.values.sm);
    };
    checkWidth();

    // Use ResizeObserver for responsive detection
    const resizeObserver = new window.ResizeObserver(checkWidth);
    resizeObserver.observe(el);
    window.addEventListener('resize', checkWidth);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkWidth);
    }
  }, [theme.breakpoints.values.sm]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateFade = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowLeftFade(scrollLeft > 50);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 1);
    };

    el.addEventListener('scroll', updateFade);
    window.addEventListener('resize', updateFade);
    updateFade();

    return () => {
      el.removeEventListener('scroll', updateFade);
      window.removeEventListener('resize', updateFade);
    };
  }, []);

  // Ensure fade is updated after children change (e.g. on first load)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Use rAF to ensure layout is complete
    const raf = requestAnimationFrame(() => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowLeftFade(scrollLeft > 50);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 1);
    });
    return () => cancelAnimationFrame(raf);
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const scrollAmount = container.clientWidth;
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const scrollArrowsOffset = isCompact ? 10 : -10; // Adjust offset based on compact mode
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
      <Box sx={{ position: 'relative' }}>
        {/* Fade overlays */}
        {showLeftFade && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 60,
              background: `linear-gradient(to right, ${theme.palette.background.default} 40%, transparent)`,
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
              width: 60,
              background: `linear-gradient(to left, ${theme.palette.background.default} 40%, transparent)`,
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
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            ...(isNarrow && {
              '& > *': {
                scrollSnapAlign: 'start',
                flex: '0 0 auto',
                minWidth: '100%',
              },
            }),
            ...(!isNarrow && {
              scrollSnapType: 'x mandatory',
            }),
            scrollBehavior: 'smooth',
            px: 2,
          }}
        />
        <Box sx={{ position: 'relative' }}>
          {/* Arrows */}
          {!!showLeftFade && (
            <IconButton
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                scroll('left');
              }}
              sx={{
                position: 'absolute',
                top: '50%',
                left: scrollArrowsOffset,
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
          )}
          {!!showRightFade && (
            <IconButton
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                scroll('right');
              }}
              sx={{
                position: 'absolute',
                top: '50%',
                right: scrollArrowsOffset,
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
          )}

          {/* Scrollable container */}
          <Box
            ref={scrollRef}
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 2,
              scrollPaddingX: '1rem',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
