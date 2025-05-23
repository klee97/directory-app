"use client";
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import useTheme from '@mui/material/styles/useTheme';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Link from 'next/link';

interface FeatureCTABannerProps {
  onClose?: () => void;
  actionUrl?: string;
  buttonText?: string;
}

export default function FeatureCTABanner({
  onClose,
  actionUrl,
  buttonText = "Sign Up Now"
}: FeatureCTABannerProps) {
  const [open, setOpen] = useState<boolean>(false);
  const bannerKey = 'feature-favorites-banner-dismissed';
  const theme = useTheme();
  useEffect(() => {
    // Check if the user has previously dismissed this banner
    const isBannerDismissed = localStorage.getItem(bannerKey) === 'dismissed';
    if (!isBannerDismissed) {
      setOpen(true);
    }
  }, [bannerKey]);

  const handleClose = (): void => {
    setOpen(false);
    // Store the dismissal in localStorage
    localStorage.setItem(bannerKey, 'dismissed');
    if (onClose) onClose();
  };

  if (!open) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        background: theme.palette.mode === 'light' ? 'linear-gradient(90deg, #009688,rgb(74, 170, 210))' : theme.palette.background.default,
        color: 'white',
        py: 2,
        position: 'relative',
        borderRadius: 0
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                <FavoriteIcon sx={{ mr: 1, fontSize: 20, verticalAlign: 'text-bottom' }} />
                Save your favorite artists for later
              </Typography>
              <Typography variant="body2">
                {process.env.NEXT_PUBLIC_BANNER_TEXT ?? "Create an account to save your favorite artists for easy access!"}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            component={Link}
            href={actionUrl}
            sx={{
              bgcolor: theme.palette.mode === 'light' ? 'white' : theme.palette.primary.main,
              color: theme.palette.mode === 'light' ? theme.palette.info.main : theme.palette.background.paper,
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: theme.palette.mode === 'light'
                  ? 'rgba(255,255,255,0.9)'
                  : theme.palette.secondary.main,
              },
              whiteSpace: 'nowrap',
            }}
          >
            {buttonText}
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: 2 }}>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
              aria-label="close"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Paper>
  );
}