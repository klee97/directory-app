import Container from '@mui/material/Container';
import FilterableVendorTable from './FilterableVendorTable';
import { Typography } from '@mui/material';

export default function Directory(props: { disableCustomTheme?: boolean }) {
  return (
    <Container
      maxWidth="lg"
      component="main"
      sx={{ display: 'flex', flexDirection: 'column', my: 16, gap: 4 }}
    >
      <div>
        <Typography variant="h1" gutterBottom>
          Directory
        </Typography>
        <Typography>Stay in the loop with the latest about our vendors</Typography>
      </div>
      <FilterableVendorTable />
    </Container>
  );
}