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

// Width of the edge fade overlays. Snapped items are inset by this amount
// (via scroll-padding) so a card's left edge never lands under the fade/arrow.
const FADE_WIDTH = 60;
const GAP = 16; // matches the `gap: 2` spacing on the scroll container

export const Carousel = ({ children, title, isCompact = false }: CarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);
  const theme = useTheme();

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
    const container = scrollRef.current;
    if (!container) return;

    // Advance by a single card so each click lands cleanly on a snap point.
    // Falls back to a full viewport if there are no children to measure.
    const firstChild = container.firstElementChild as HTMLElement | null;
    const scrollAmount = firstChild
      ? firstChild.offsetWidth + GAP
      : container.clientWidth;

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
              width: FADE_WIDTH,
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
              width: FADE_WIDTH,
              background: `linear-gradient(to left, ${theme.palette.background.default} 40%, transparent)`,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        )}
        <Box sx={{ position: 'relative' }}>
          {/* Arrows. Kept mounted and toggled via `display` (rather than
              conditionally rendered) so the node isn't detached from the DOM
              mid-interaction when the fade state recomputes — e.g. as carousel
              images finish loading. */}
          <IconButton
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              scroll('left');
            }}
            sx={{
              display: showLeftFade ? 'inline-flex' : 'none',
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
          <IconButton
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              scroll('right');
            }}
            sx={{
              display: showRightFade ? 'inline-flex' : 'none',
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

          {/* Scrollable container. Item sizing (width, flex, scroll-snap
              alignment) is left to the children so the same carousel can host
              differently-sized cards — e.g. blog posts and vendors on the
              landing page. */}
          <Box
            ref={scrollRef}
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: `${GAP}px`,
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              // Inset snap targets past the fade/arrow so a snapped card's
              // leading edge stays fully visible instead of tucking under it.
              scrollPaddingLeft: `${FADE_WIDTH}px`,
              scrollPaddingRight: `${FADE_WIDTH}px`,
              px: 2,
              pt: 1,
              pb: 5,
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
