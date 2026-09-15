import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { LocationResult } from "@/types/location";

export const ResultsCount = ({
  loading,
  count,
  location,
}: {
  loading: boolean;
  count: number;
  location: LocationResult | null;
}) => (
  <Typography variant="h6" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
    {loading ? <LoadingText /> : <ResultCountText count={count} location={location} />}
  </Typography>
);

const LoadingText = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <CircularProgress size={20} />
    Loading artists...
  </Box>
);

const ResultCountText = ({ count, location }: { count: number; location: LocationResult | null }) => (
  <>
    {count} Wedding Beauty Artist{count === 1 ? '' : 's'} found
    {!!location && ` near ${location.display_name}`}
  </>
);