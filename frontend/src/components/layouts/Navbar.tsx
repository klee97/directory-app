"use client"
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import { useColorScheme, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/assets/logo.jpeg';
import Collapse from '@mui/material/Collapse';
import useMediaQuery from '@mui/material/useMediaQuery';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { AlertColor } from '@mui/material/Alert';
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Settings from "@mui/icons-material/Settings";
import Favorite from "@mui/icons-material/Favorite";
import Logout from "@mui/icons-material/Logout";
import { createClient } from '@/lib/supabase/client';
import { useNotification } from '@/contexts/NotificationContext';
import { isDevelopment, isDevOrPreview } from '@/lib/env/env';
import DevTools from './DevTools';

const pages = ["About", "Contact", "FAQ", "Recommend"];
const vendorPages: string[] = [];
const resources = ["Blog"];
const Title = 'ASIAN WEDDING MAKEUP';

export const Navbar = ({ isVendorNavbar }: { isVendorNavbar: boolean }) => {
  const [mounted, setMounted] = React.useState(false);
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElResources, setAnchorElResources] = React.useState<null | HTMLElement>(null);
  const [resourcesExpanded, setResourcesExpanded] = React.useState(false);
  const [anchorElProfile, setAnchorElProfile] = React.useState<null | HTMLElement>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [notification, setNotification] = React.useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const supabase = createClient();
  const { addNotification } = useNotification();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  console.log(isVendorNavbar)

  // Handle hydration and initial loading
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication status
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    if (mounted) {
      checkAuth();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [mounted, supabase]);

  // Close menus when screen size changes
  React.useEffect(() => {
    if (mounted && isMobile) {
      setAnchorElNav(null);
      setAnchorElResources(null);
      setResourcesExpanded(false);
      setAnchorElProfile(null);
    }
  }, [isMobile, mounted]);

  // Cleanup menu states on unmount
  React.useEffect(() => {
    return () => {
      setAnchorElNav(null);
      setAnchorElResources(null);
      setResourcesExpanded(false);
      setAnchorElProfile(null);
    };
  }, []);

  const { mode, setMode } = useColorScheme();
  if (!mounted || !mode) {
    return (
      <AppBar
        position={isVendorNavbar ? "fixed" : "static"}
        sx={{
          bgcolor: isVendorNavbar ? 'info.dark' : 'primary.main',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Skeleton variant="rectangular" width={40} height={40} />
            <Skeleton variant="text" width={200} sx={{ ml: 2 }} />
          </Toolbar>
        </Container>
      </AppBar>
    );
  }

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setAnchorElNav(event.currentTarget);
    setResourcesExpanded(false);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
    setResourcesExpanded(false);
  };

  const handleOpenResourcesMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setAnchorElResources(event.currentTarget);
    setResourcesExpanded(true);
  };

  const handleCloseResourcesMenu = () => {
    setAnchorElResources(null);
    setResourcesExpanded(false);
  };

  const handleOpenProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setAnchorElProfile(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setAnchorElProfile(null);
  };

  const handleMenuLinkClick = (event: React.MouseEvent, href: string) => {
    event.preventDefault();
    handleCloseNavMenu();
    window.location.href = href;
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.reload();
      addNotification('Successfully logged out');
    } catch (error) {
      console.error('Error signing out:', error);
      addNotification('Failed to log out', 'error');
    }
  };

  const renderAuthButtons = () => {
    if (!isLoggedIn) {
      return (
        <Button
          color="inherit"
          variant="outlined"
          onClick={(e) => handleMenuLinkClick(e, '/login')}
          sx={{
            mx: 1,
            display: { xs: 'none', md: 'block' }
          }}
        >
          Login
        </Button>
      );
    }
    return null;
  };

  const renderProfileMenu = () => {
    if (isLoggedIn) {
      return (
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <IconButton
            size="large"
            aria-label="profile menu"
            aria-controls="menu-profile"
            aria-haspopup="true"
            onClick={handleOpenProfileMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-profile"
            anchorEl={anchorElProfile}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElProfile)}
            onClose={handleCloseProfileMenu}
          >
            <MenuItem onClick={(e) => handleMenuLinkClick(e, '/favorites')}>
              <ListItemIcon>
                <Favorite fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                <Typography sx={{ textDecoration: 'none', color: 'inherit' }}>
                  My Favorites
                </Typography>
              </ListItemText>
            </MenuItem>
            <MenuItem onClick={(e) => handleMenuLinkClick(e, '/settings')}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                <Typography sx={{ textDecoration: 'none', color: 'inherit' }}>
                  Settings
                </Typography>
              </ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                <Typography sx={{ textDecoration: 'none', color: 'inherit' }}>
                  Sign Out
                </Typography>
              </ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      );
    }
    return null;
  };

  return (
    <AppBar
      position={isVendorNavbar ? "fixed" : "static"}
      sx={{
        bgcolor: isVendorNavbar ? 'info.dark' : 'primary.main',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters
          sx={{
            minHeight: { xs: 56, sm: 64 },
            maxHeight: { xs: 56, sm: 64 }, // Constrain the height
          }}
        >
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              color="inherit"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {!isVendorNavbar ? pages.map((page) => (
                <MenuItem
                  key={page}
                  onClick={(e) => handleMenuLinkClick(e, `/${page.toLowerCase()}`)}
                >
                  <Typography
                    sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}
                  >
                    {page}
                  </Typography>
                </MenuItem>
              ))
                : vendorPages.map((page) => (
                  <MenuItem
                    key={page}
                    onClick={(e) => handleMenuLinkClick(e, `/${page.toLowerCase()}`)}
                  >
                    <Typography
                      sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}
                    >
                      {page}
                    </Typography>
                  </MenuItem>
                ))}
              {!isVendorNavbar && (
                <Box sx={{ width: '100%' }}>
                  <MenuItem
                    key="Resources"
                    onClick={() => setResourcesExpanded(!resourcesExpanded)}
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography sx={{ textDecoration: 'none', color: 'inherit' }}>
                      Resources
                    </Typography>
                    {resourcesExpanded ? <ExpandLess fontSize='small' /> : <ExpandMore fontSize='small' />}
                  </MenuItem>

                  <Collapse in={resourcesExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ pl: 2 }}>
                      {resources.map((resource) => (
                        <MenuItem
                          key={resource}
                          onClick={(e) => handleMenuLinkClick(e, `/${resource.toLowerCase()}`)}
                        >
                          <Typography
                            sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}
                          >
                            {resource}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Box>
                  </Collapse>
                </Box>
              )}
              {process.env.NEXT_PUBLIC_FEATURE_FAVORITES_ENABLED === 'true' && (
                <Box sx={{ width: '100%' }}>
                  <Divider />
                  {!isLoggedIn ? (
                    <MenuItem onClick={(e) => handleMenuLinkClick(e, '/login')}>
                      <Typography sx={{ textDecoration: 'none', color: 'inherit' }}>
                        Login
                      </Typography>
                    </MenuItem>
                  ) : (
                    <>
                      <MenuItem onClick={(e) => handleMenuLinkClick(e, '/favorites')}>
                        <ListItemIcon>
                          <Favorite fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>
                          <Typography sx={{ textDecoration: 'none', color: 'inherit' }}>
                            My Favorites
                          </Typography>
                        </ListItemText>
                      </MenuItem>
                      <MenuItem onClick={(e) => handleMenuLinkClick(e, '/settings')}>
                        <ListItemIcon>
                          <Settings fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>
                          <Typography sx={{ textDecoration: 'none', color: 'inherit' }}>
                            Settings
                          </Typography>
                        </ListItemText>
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleSignOut}>
                        <ListItemIcon>
                          <Logout fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>
                          <Typography sx={{ textDecoration: 'none', color: 'inherit' }}>
                            Sign Out
                          </Typography>
                        </ListItemText>
                      </MenuItem>
                    </>
                  )}
                </Box>
              )}
            </Menu>
          </Box>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image src={Logo.src} width={40} height={40} alt={"logo"} style={{ marginRight: '16px' }} />
            <Typography
              variant="h1"
              noWrap
              sx={{
                fontSize: { xs: '1rem', md: '1.5rem' },
                mr: 2,
                fontWeight: 550,
                letterSpacing: '.3rem',
                color: 'white',
                textDecoration: 'none',
                display: { xs: 'flex', md: 'flex' },
                flexGrow: { xs: 1, md: 0 },
              }}
            >
              {Title}
            </Typography>
          </Link>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {!isVendorNavbar ? pages.map((page) => (
              <Button
                key={page}
                onClick={(e) => handleMenuLinkClick(e, `/${page.toLowerCase()}`)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            )) : vendorPages.map((page) => (
              <Button
                key={page}
                onClick={(e) => handleMenuLinkClick(e, `/${page.toLowerCase()}`)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
            {!isVendorNavbar && (
              <Button
                key="Resources"
                onClick={handleOpenResourcesMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Resources
              </Button>
            )}
            <Menu
              id="menu-resources"
              anchorEl={anchorElResources}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElResources)}
              onClose={handleCloseResourcesMenu}
            >
              {resources.map((resource) => (
                <MenuItem
                  key={resource}
                  onClick={(e) => handleMenuLinkClick(e, `/${resource.toLowerCase()}`)}
                >
                  <Typography sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}>
                    {resource}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>


          {isDevelopment() && (
            <DevTools />
          )}
          {isDevOrPreview() && (
            <FormControl>
              <FormLabel id="demo-theme-toggle">Theme</FormLabel>
              <RadioGroup
                aria-labelledby="demo-theme-toggle"
                name="theme-toggle"
                row
                value={mode}
                onChange={(event) =>
                  setMode(event.target.value as 'system' | 'light' | 'dark')
                }
              >
                <FormControlLabel value="system" control={<Radio />} label="System" />
                <FormControlLabel value="light" control={<Radio />} label="Light" />
                <FormControlLabel value="dark" control={<Radio />} label="Dark" />
              </RadioGroup>
            </FormControl>
          )}
          {process.env.NEXT_PUBLIC_FEATURE_FAVORITES_ENABLED === 'true' && renderAuthButtons()}
          {process.env.NEXT_PUBLIC_FEATURE_FAVORITES_ENABLED === 'true' && renderProfileMenu()}
        </Toolbar>
      </Container>
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </AppBar>
  );
}
