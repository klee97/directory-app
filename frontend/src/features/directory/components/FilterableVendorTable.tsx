"use client";
import * as React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';
import { SearchBar } from './SearchBar';
import { VendorGrid } from './VendorGrid';

const cardData = [
  {
    img: 'https://picsum.photos/800/450?random=1',
    tag: 'Engineering',
    title: 'Revolutionizing software development with cutting-edge tools',
    description:
      'Our latest engineering tools are designed to streamline workflows and boost productivity. Discover how these innovations are transforming the software development landscape.',
    authors: [
      { name: 'Remy Sharp', avatar: '/static/images/avatar/1.jpg' },
      { name: 'Travis Howard', avatar: '/static/images/avatar/2.jpg' },
    ],
  },
  {
    img: 'https://picsum.photos/800/450?random=2',
    tag: 'Product',
    title: 'Innovative product features that drive success',
    description:
      'Explore the key features of our latest product release that are helping businesses achieve their goals. From user-friendly interfaces to robust functionality, learn why our product stands out.',
    authors: [{ name: 'Erica Johns', avatar: '/static/images/avatar/6.jpg' }],
  },
  {
    img: 'https://picsum.photos/800/450?random=3',
    tag: 'Design',
    title: 'Designing for the future: trends and insights',
    description:
      'Stay ahead of the curve with the latest design trends and insights. Our design team shares their expertise on creating intuitive and visually stunning user experiences.',
    authors: [{ name: 'Kate Morrison', avatar: '/static/images/avatar/7.jpg' }],
  },
  {
    img: 'https://picsum.photos/800/450?random=4',
    tag: 'Company',
    title: "Our company's journey: milestones and achievements",
    description:
      "Take a look at our company's journey and the milestones we've achieved along the way. From humble beginnings to industry leader, discover our story of growth and success.",
    authors: [{ name: 'Cindy Baker', avatar: '/static/images/avatar/3.jpg' }],
  },
  {
    img: 'https://picsum.photos/800/450?random=45',
    tag: 'Engineering',
    title: 'Pioneering sustainable engineering solutions',
    description:
      "Learn about our commitment to sustainability and the innovative engineering solutions we're implementing to create a greener future. Discover the impact of our eco-friendly initiatives.",
    authors: [
      { name: 'Agnes Walker', avatar: '/static/images/avatar/4.jpg' },
      { name: 'Trevor Henderson', avatar: '/static/images/avatar/5.jpg' },
    ],
  },
  {
    img: 'https://picsum.photos/800/450?random=6',
    tag: 'Product',
    title: 'Maximizing efficiency with our latest product updates',
    description:
      'Our recent product updates are designed to help you maximize efficiency and achieve more. Get a detailed overview of the new features and improvements that can elevate your workflow.',
    authors: [{ name: 'Travis Howard', avatar: '/static/images/avatar/2.jpg' }],
  },
  {
    img: 'https://picsum.photos/800/450?random=6',
    tag: 'Product',
    title: 'Maximizing efficiency with our latest product updates',
    description:
      'Our recent product updates are designed to help you maximize efficiency and achieve more. Get a detailed overview of the new features and improvements that can elevate your workflow.',
    authors: [{ name: 'Travis Howard', avatar: '/static/images/avatar/2.jpg' }],
  },
  {
    img: 'https://picsum.photos/800/450?random=6',
    tag: 'Product',
    title: 'Maximizing efficiency with our latest product updates',
    description:
      'Our recent product updates are designed to help you maximize efficiency and achieve more. Get a detailed overview of the new features and improvements that can elevate your workflow.',
    authors: [{ name: 'Travis Howard', avatar: '/static/images/avatar/2.jpg' }],
  },
  {
    img: 'https://picsum.photos/800/450?random=6',
    tag: 'Product',
    title: 'Maximizing efficiency with our latest product updates',
    description:
      'Our recent product updates are designed to help you maximize efficiency and achieve more. Get a detailed overview of the new features and improvements that can elevate your workflow.',
    authors: [{ name: 'Travis Howard', avatar: '/static/images/avatar/2.jpg' }],
  },
  {
    img: 'https://picsum.photos/800/450?random=6',
    tag: 'Product',
    title: 'Maximizing efficiency with our latest product updates',
    description:
      'Our recent product updates are designed to help you maximize efficiency and achieve more. Get a detailed overview of the new features and improvements that can elevate your workflow.',
    authors: [{ name: 'Travis Howard', avatar: '/static/images/avatar/2.jpg' }],
  },
  {
    img: 'https://picsum.photos/800/450?random=6',
    tag: 'Product',
    title: 'Maximizing efficiency with our latest product updates',
    description:
      'Our recent product updates are designed to help you maximize efficiency and achieve more. Get a detailed overview of the new features and improvements that can elevate your workflow.',
    authors: [{ name: 'Travis Howard', avatar: '/static/images/avatar/2.jpg' }],
  },
  {
    img: 'https://picsum.photos/800/450?random=6',
    tag: 'Product',
    title: 'Maximizing efficiency with our latest product updates',
    description:
      'Our recent product updates are designed to help you maximize efficiency and achieve more. Get a detailed overview of the new features and improvements that can elevate your workflow.',
    authors: [{ name: 'Travis Howard', avatar: '/static/images/avatar/2.jpg' }],
  }, {
    img: 'https://picsum.photos/800/450?random=6',
    tag: 'Product',
    title: 'Maximizing efficiency with our latest product updates',
    description:
      'Our recent product updates are designed to help you maximize efficiency and achieve more. Get a detailed overview of the new features and improvements that can elevate your workflow.',
    authors: [{ name: 'Travis Howard', avatar: '/static/images/avatar/2.jpg' }],
  },
];

export default function FilterableVendorTable() {
  const [focusedCardIndex, setFocusedCardIndex] = React.useState<number | null>(
    null,
  );

  const handleFocus = (index: number) => {
    setFocusedCardIndex(index);
  };

  const handleBlur = () => {
    setFocusedCardIndex(null);
  };

  const handleClick = () => {
    console.info('You clicked the filter chip.');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          flexDirection: 'row',
          gap: 1,
          width: { xs: '100%', md: 'fit-content' },
          overflow: 'auto',
        }}
      >
        <SearchBar />
        <IconButton size="small" aria-label="RSS feed">
          <RssFeedRoundedIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column-reverse', md: 'row' },
          width: '100%',
          justifyContent: 'space-between',
          alignItems: { xs: 'start', md: 'center' },
          gap: 4,
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            flexDirection: 'row',
            gap: 3,
            overflow: 'auto',
          }}
        >
          <Chip onClick={handleClick} size="medium" label="All categories" />
          <Chip
            onClick={handleClick}
            size="medium"
            label="Company"
            sx={{
              backgroundColor: 'transparent',
              border: 'none',
            }}
          />
          <Chip
            onClick={handleClick}
            size="medium"
            label="Product"
            sx={{
              backgroundColor: 'transparent',
              border: 'none',
            }}
          />
          <Chip
            onClick={handleClick}
            size="medium"
            label="Design"
            sx={{
              backgroundColor: 'transparent',
              border: 'none',
            }}
          />
          <Chip
            onClick={handleClick}
            size="medium"
            label="Engineering"
            sx={{
              backgroundColor: 'transparent',
              border: 'none',
            }}
          />
        </Box>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'row',
            gap: 1,
            width: { xs: '100%', md: 'fit-content' },
            overflow: 'auto',
          }}
        >
          <SearchBar />
          <IconButton size="small" aria-label="RSS feed">
            <RssFeedRoundedIcon />
          </IconButton>
        </Box>
      </Box>
      <VendorGrid
        handleFocus={handleFocus}
        handleBlur={handleBlur}
        focusedCardIndex={focusedCardIndex}
        cardData={cardData}
      />
    </Box >
  );
}