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
  const { vendorCount, verifiedCount, offersHairCount, offersMakeupCount, priceRange } = stats;

  const servicePhrase =
    offersHairCount && offersMakeupCount
      ? `${offersMakeupCount} offering makeup and ${offersHairCount} offering hair styling`
      : offersMakeupCount
        ? `${offersMakeupCount} offering makeup`
        : offersHairCount
          ? `${offersHairCount} offering hair styling`
          : null;

  const pricePhrase = priceRange
    ? `Prices for hair or makeup wedding services range from $${priceRange.min} to $${priceRange.max}.`
    : '';

  const verifiedPhrase = verifiedCount
    ? `${verifiedCount} ${verifiedCount === 1 ? 'is' : 'are'} verified by the wedding beauty artist.`
    : '';

  const sentence = [
    `There ${vendorCount === 1 ? 'is' : 'are'} ${vendorCount} Asian wedding makeup ${vendorCount === 1 ? 'artist' : 'artists'} near ${location.display_name}${servicePhrase ? `, ${servicePhrase}` : ''}.`,
    verifiedPhrase,
    pricePhrase,
  ].filter(Boolean).join(' ');

  return (
    <Box sx={{ mb: 2 }} data-testid="location-intro">
      <Typography>{sentence}</Typography>
    </Box>
  );
}