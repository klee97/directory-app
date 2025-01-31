'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Card,
  CardContent,
  useTheme,
  styled,
} from '@mui/material';
import { Public, LocationOn, Mail, AccessTime } from '@mui/icons-material';
import { Vendor } from '@/types/vendor';

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '400px',
  backgroundColor: theme.palette.grey[200],
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
  }
}));

const StickyCard = styled(Card)(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(2),
}));

interface VendorDetailsProps {
  vendor: Vendor;
}

export function VendorDetails({ vendor }: VendorDetailsProps) {
  const theme = useTheme();

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg" sx={{ height: '100%', position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              bottom: theme.spacing(4),
              color: 'white',
            }}
          >
            <Typography variant="h2" component="h1" sx={{ 
              fontFamily: 'serif',
              mb: 2,
              fontWeight: 'light'
            }}>
              {vendor.business_name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" />
                <Typography variant="subtitle1">{vendor.region}</Typography>
              </Box>
              {vendor.travels_world_wide === 'Yes' && (
                <Chip
                  icon={<Public />}
                  label="Available Worldwide"
                  size="small"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              )}
            </Box>
          </Box>
        </Container>
      </HeroSection>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {/* Left Column - Details */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* About Section */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h5" component="h2" sx={{ 
                  fontFamily: 'serif',
                  mb: 3 
                }}>
                  About
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  { "More info coming soon. Contact the artist to learn more about their services and availability."}
                </Typography>
              </Paper>

              {/* Services & Pricing */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h5" component="h2" sx={{ 
                  fontFamily: 'serif',
                  mb: 3 
                }}>
                  Services & Pricing
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Bridal Hair & Makeup
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Complete bridal beauty package
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontFamily: 'serif' }}>
                    {vendor['bridal_hair_&_makeup_price'] 
                      ? `$${vendor['bridal_hair_&_makeup_price']}`
                      : 'Custom Quote'}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>

          {/* Right Column - Contact Card */}
          <Grid item xs={12} md={4}>
            <StickyCard elevation={0}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" component="h2" sx={{ 
                  fontFamily: 'serif',
                  mb: 3,
                  textAlign: 'center'
                }}>
                  Get in Touch
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<Mail />}
                  sx={{ mb: 3 }}
                >
                  Contact Vendor
                </Button>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}>
                    <AccessTime fontSize="small" />
                    Typically responds within 24 hours
                  </Typography>
                </Box>
                <Box sx={{ 
                  pt: 3, 
                  borderTop: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Based in {vendor.region}
                    </Typography>
                  </Box>
                  {vendor.travels_world_wide === 'Yes' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Public color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        Available for worldwide travel
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </StickyCard>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}