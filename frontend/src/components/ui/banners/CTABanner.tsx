"use client";
import { useState, useEffect, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import useTheme from '@mui/material/styles/useTheme';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';

interface CTABannerProps {
  /** Unique key for localStorage to track dismissal */
  bannerKey: string;
  /** Icon to display next to the title */
  icon?: ReactNode;
  /** Main heading text */
  title: string;
  /** Supporting description text */
  description: string;
  /** URL for the call-to-action button */
  actionUrl: string;
  /** Text for the call-to-action button */
  buttonText: string;
  /** Callback when banner is closed */
  onClose?: () => void;
  /** Whether the banner should be full width or in a container */
  fullWidth?: boolean;
  /** Whether to show the close button (defaults to true) */
  showCloseButton?: boolean;
}

export default function CTABanner({
  bannerKey,
  icon,
  title,
  description,
  actionUrl,
  buttonText,
  onClose,
  fullWidth = false,
  showCloseButton = true
}: CTABannerProps) {
  const [open, setOpen] = useState<boolean>(false);
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
    localStorage.setItem(bannerKey, 'dismissed');
    if (onClose) onClose();
  };

  if (!open) return null;

  const content = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        gap: 2,
        px: { xs: 2, sm: 3 }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {icon && <Box component="span" sx={{ mr: 1, verticalAlign: 'text-bottom', display: 'inline-flex' }}>{icon}</Box>}
            {title}
          </Typography>
          <Typography variant="body2">
            {description}
          </Typography>
        </Box>
      </Box>
      <Button
        variant="contained"
        component={Link}
        href={actionUrl}
        sx={{
          bgcolor: theme.palette.info.contrastText,
          color: theme.palette.info.main,
          fontWeight: 'bold',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.9)'
          },
          whiteSpace: 'nowrap',
        }}
      >
        {buttonText}
      </Button>
      {showCloseButton && <IconButton
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
      }
    </Box>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.info.light})`,
        color: theme.palette.info.contrastText,
        py: 2,
        position: 'relative',
        borderRadius: 0
      }}
    >
      {fullWidth ? content : <Container maxWidth="lg">{content}</Container>}
    </Paper>
  );
}