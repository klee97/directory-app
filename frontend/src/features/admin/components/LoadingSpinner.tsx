import { CircularProgress } from "@mui/material";
import { Container, Box } from "@mui/system";

const LoadingSpinner = () => {
  return (<Container maxWidth="lg">
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  </Container>);
}

export default LoadingSpinner;