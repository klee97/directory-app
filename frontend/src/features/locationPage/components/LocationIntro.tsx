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
    ? ` Prices for bridal services range from $${priceRange.min} to $${priceRange.max}.`
    : '';

  const verifiedPhrase = verifiedCount
    ? ` ${verifiedCount} ${verifiedCount === 1 ? 'is' : 'are'} verified by our team.`
    : '';

  return (
    <Box sx={{ mb: 2 }}>
      <Typography>
        There {vendorCount === 1 ? 'is' : 'are'} {vendorCount} Asian wedding makeup
        {vendorCount === 1 ? ' artist' : ' artists'} near {location.display_name}
        {servicePhrase ? `, ${servicePhrase}` : ''}.
        {verifiedPhrase ? ` ${verifiedPhrase}` : ''}
        {pricePhrase ? ` ${pricePhrase}` : ''}
      </Typography>
    </Box>
  );
}