import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LocationResult } from '@/types/location';
import { LocationStats } from '@/lib/location/computeLocationStats';

export function LocationIntro({
  location,
  stats,
}: {
  location: LocationResult;
  stats: LocationStats;
}) {
  const { vendorCount, offersHairCount, offersMakeupCount, priceRange } = stats;

  const servicePhrase =
    offersHairCount && offersMakeupCount
      ? `${offersMakeupCount} artist${offersMakeupCount === 1 ? '' : 's'}  offer${offersMakeupCount === 1 ? 's' : ''} makeup and ${offersHairCount} artist${offersHairCount === 1 ? '' : 's'} offer${offersHairCount === 1 ? 's' : ''} hair styling.`
      : offersMakeupCount
        ? `${offersMakeupCount} artist${offersMakeupCount === 1 ? '' : 's'} offer${offersMakeupCount === 1 ? 's' : ''} makeup.`
        : offersHairCount
          ? `${offersHairCount} artist${offersHairCount === 1 ? '' : 's'} offer${offersHairCount === 1 ? 's' : ''} hair styling.`
          : null;

  const pricePhrase = priceRange
    ? `Prices for hair or makeup wedding services range from $${priceRange.min} to $${priceRange.max}.`
    : '';

  const sentence = [
    `There ${vendorCount === 1 ? 'is' : 'are'} ${vendorCount} wedding makeup ${vendorCount === 1 ? 'artist' : 'artists'} specializing in Asian features near ${location.display_name}.`,
    servicePhrase,
    pricePhrase,
  ].filter(Boolean).join(' ');

  return (
    <Box sx={{ mb: 2 }} data-testid="location-intro">
      <Typography>{sentence}</Typography>
    </Box>
  );
}