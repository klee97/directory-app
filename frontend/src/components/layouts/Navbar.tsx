"use client"
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
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/assets/logo.jpeg';
import Collapse from '@mui/material/Collapse';
import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { AlertColor } from '@mui/material/Alert';
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { isDevelopment, isDevOrPreview } from '@/lib/env/env';
import DevTools from './DevTools';
import { useAuth } from '@/contexts/AuthContext';
import { isVendorRole } from '@/lib/auth/userRole';
import NavigationMenu from '@/components/layouts/NavigationMenu';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/ui/UserAvatar';
import ThemeSelector from './ThemeSelector';
import { useEffect, useState } from 'react';


const pages = ["About", "Contact", "FAQ", "Recommend"];
const vendorPages: string[] = [];
const resources = ["Blog"];
const Title = 'ASIAN WEDDING MAKEUP';
const VendorsSubtitle = 'For Vendors';

export const Navbar = ({ isVendorNavbar }: { isVendorNavbar: boolean }) => {
  const [mounted, setMounted] = useState(false);
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElResources, setAnchorElResources] = useState<null | HTMLElement>(null);
  const [resourcesExpanded, setResourcesExpanded] = useState(false);
  const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { isLoggedIn, isLoading: isAuthLoading, isRoleLoading, role } = useAuth();
  const isVendor = isVendorRole(role);
  const isAuthOrRoleLoading = isAuthLoading || isRoleLoading
  const router = useRouter();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const homeUrl = isVendorNavbar ? '/partner/dashboard' : '/';

  // Handle hydration and initial loading
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menus when screen size changes
  useEffect(() => {
    if (mounted && isMobile) {
      setAnchorElNav(null);
      setAnchorElResources(null);
      setResourcesExpanded(false);
      setAnchorElProfile(null);
    }
  }, [isMobile, mounted]);

  // Cleanup menu states on unmount
  useEffect(() => {
    return () => {
      setAnchorElNav(null);
      setAnchorElResources(null);
      setResourcesExpanded(false);
      setAnchorElProfile(null);
    };
  }, []);

  if (!mounted || isAuthLoading) {
    return (
      <>
        <AppBar
          position={isVendorNavbar ? "fixed" : "static"}
          sx={{
            bgcolor: isVendorNavbar ? 'background.vendorNavbar' : 'background.publicNavbar',
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
        {isVendorNavbar && <Toolbar />}
      </>
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
    router.push(href);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const renderAuthButtons = () => {
    if (isAuthLoading) {
      return null; // Don't show anything while loading
    }
    if (!isLoggedIn) {
      return (
        <Button
          color="inherit"
          variant="outlined"
          onClick={(e) => handleMenuLinkClick(e, isVendorNavbar ? '/partner/login' : '/login')}
          sx={{
            mx: 1,
            display: { xs: 'none', md: 'block' }
          }}
        >
          Log in
        </Button>
      );
    }
    return null;
  };

  const renderProfileMenu = () => {
    if (isAuthOrRoleLoading) {
      return null; // Don't show anything while loading
    }
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
            data-testid="profile-button"
          >
            <UserAvatar />
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
            <NavigationMenu
              isVendorUser={isVendor}
              variant="menu"
              onItemClick={handleCloseProfileMenu}
            />
          </Menu>
        </Box>
      );
    }
    return null;
  };

  return (
    <>
      <AppBar
        position={isVendorNavbar ? "fixed" : "static"}
        sx={{
          bgcolor: isVendorNavbar ? 'background.vendorNavbar' : 'background.publicNavbar',
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
                aria-label="open navigation menu"
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
                {isVendorNavbar ? vendorPages.map((page) => (
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
                  : pages.map((page) => (
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
                {!isAuthOrRoleLoading && (
                  <Box sx={{ width: '100%' }}>
                    <Divider />
                    {!isLoggedIn ? (
                      <MenuItem onClick={(e) => handleMenuLinkClick(e, isVendorNavbar ? '/partner/login' : '/login')}>
                        <Typography sx={{ textDecoration: 'none', color: 'inherit' }}>
                          Log in
                        </Typography>
                      </MenuItem>
                    ) : (
                      <NavigationMenu
                        isVendorUser={isVendor}
                        variant="menu"
                        onItemClick={handleCloseNavMenu}
                      />
                    )}
                  </Box>
                )}
                {/* Dev tools — mobile only, hidden on desktop where they render inline */}
                {isDevelopment() && (
                  <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }}>
                    <Divider />
                    <MenuItem disableRipple>
                      <DevTools />
                    </MenuItem>
                  </Box>
                )}
                {isDevOrPreview() && (
                  <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }}>
                    <Divider />
                    <MenuItem disableRipple>
                      <ThemeSelector />
                    </MenuItem>
                  </Box>
                )}
              </Menu>
            </Box>
            <Link href={homeUrl} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <Image src={Logo.src} width={40} height={40} alt={"logo"} style={{ marginRight: '16px' }} />
              <Box style={{ alignItems: 'end' }} >
                <Typography
                  variant="h1"
                  noWrap
                  sx={{
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
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
                {isVendorNavbar && (
                  <Typography
                    variant="h3"
                    noWrap
                    sx={{
                      fontSize: { xs: '0.8rem', md: '1rem' },
                      fontWeight: 300,
                      letterSpacing: '.1rem',
                      color: 'white',
                      textDecoration: 'none',
                      display: { xs: 'flex', md: 'flex' },
                    }}
                  >
                    {VendorsSubtitle}
                  </Typography>
                )}
              </Box>
            </Link>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {isVendorNavbar ? vendorPages.map((page) => (
                <Button
                  key={page}
                  onClick={(e) => handleMenuLinkClick(e, `/${page.toLowerCase()}`)}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page}
                </Button>
              )) : pages.map((page) => (
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
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>

                <DevTools />
              </Box>
            )}
            {isDevOrPreview() && (
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                <ThemeSelector />
              </Box>
            )}
            {renderAuthButtons()}
            {renderProfileMenu()}
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
      {isVendorNavbar && <Toolbar />}
    </>

  );
}
