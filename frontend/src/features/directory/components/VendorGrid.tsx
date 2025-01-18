import { Box, Grid as SystemGrid } from '@mui/system';
import Grid from '@mui/material/Grid2';
import { VendorCard } from './VendorCard';

export const VendorGrid = ({
  handleFocus,
  handleBlur,
  focusedCardIndex,
  cardData
}: {
  handleFocus: (index: number) => void,
  handleBlur: () => void,
  focusedCardIndex: number | null,
  cardData: {
    img: string;
    tag: string;
    title: string;
    description: string;
    authors: { name: string; avatar: string; }[];
  }[]
}) => {

  return (
    <Box sx={{ overflowY: 'auto', maxHeight: '100vh' }}>
      <SystemGrid container spacing={2} sx={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {cardData.map((card, index) => (
          <Grid key={index} size={{ xs: 12, md: 4 }}>
            <VendorCard
              cardData={card}
              variant="outlined"
              onFocus={() => handleFocus(0)}
              onBlur={handleBlur}
              tabIndex={0}
              className={focusedCardIndex === 0 ? 'Mui-focused' : ''}
            >
            </VendorCard>
          </Grid>
        ))}
      </SystemGrid>
    </Box>
  );
};