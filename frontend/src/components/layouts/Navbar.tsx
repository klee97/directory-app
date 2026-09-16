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
import { useHasMounted } from '@/hooks/useHasMounted';


const pages = ["Vendors", "About", "Contact", "Recommend"];
const vendorPages: string[] = [];
const resources = ["FAQ", "Blog"];
const Title = 'ASIAN WEDDING MAKEUP';
const VendorsSubtitle = 'For Vendors';

export const Navbar = ({ isVendorNavbar }: { isVendorNavbar: boolean }) => {
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

  const hasMounted = useHasMounted();
  const { isLoggedIn, isLoading: isAuthLoading, isRoleLoading, role } = useAuth();
  const isVendor = isVendorRole(role);
  const isAuthOrRoleLoading = isAuthLoading || isRoleLoading
  const router = useRouter();

  const theme = useTheme();
  // Breakpoint moved to 'lg': this is the smallest width where logo + full
  // title + full nav buttons all fit without crowding. Below this, the
  // hamburger menu takes over so the title never has to shrink or truncate.
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // Determine home URL based on navbar type and authentication status
  const homeUrl = isVendorNavbar ? (isLoggedIn ? '/partner/dashboard' : '/partner') : '/';

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isMobile) {
      setAnchorElResources(null);
      setResourcesExpanded(false);
    } else {
      setAnchorElNav(null);
    }
  }, [isMobile]);
  /* eslint-enable react-hooks/set-state-in-effect */


  if (!hasMounted || isAuthLoading) {
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
    setAnchorElResources(null);
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
    handleCloseResourcesMenu();
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
            display: { xs: 'none', lg: 'block' }
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
        <Box sx={{ display: { xs: 'none', lg: 'flex' } }}>
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
            key={isMobile ? 'mobile' : 'desktop'}
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
            <Box sx={{ display: { xs: 'flex', lg: 'none' } }}>
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
                key={isMobile ? 'mobile' : 'desktop'}
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
                sx={{ display: { xs: 'block', lg: 'none' } }}
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
                  <Box sx={{ display: { xs: 'block', lg: 'none' }, width: '100%' }}>
                    <Divider />
                    <MenuItem disableRipple>
                      <DevTools />
                    </MenuItem>
                  </Box>
                )}
                {isDevOrPreview() && (
                  <Box sx={{ display: { xs: 'block', lg: 'none' }, width: '100%' }}>
                    <Divider />
                    <MenuItem disableRipple>
                      <ThemeSelector />
                    </MenuItem>
                  </Box>
                )}
              </Menu>
            </Box>
            <Link
              href={homeUrl}
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                marginLeft: 8,
              }}
            >
              <Box
                sx={{
                  width: { xs: 28, lg: 40 },
                  height: { xs: 28, lg: 40 },
                  mr: { xs: 1, lg: 2 },
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                <Image src={Logo} fill alt={"logo"} style={{ objectFit: 'contain' }} />
              </Box>
              <Box sx={{ alignItems: 'end' }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '1.2rem', lg: '1.5rem' },
                    mr: 2,
                    fontWeight: 550,
                    letterSpacing: { xs: '.05rem', lg: '.3rem' },
                    color: 'white',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap', // never wraps or truncates — full title always shown
                  }}
                >
                  {Title}
                </Typography>
                {isVendorNavbar && (
                  <Typography
                    variant="h3"
                    noWrap
                    sx={{
                      fontSize: { xs: '0.8rem', lg: '1rem' },
                      fontWeight: 300,
                      letterSpacing: '.1rem',
                      color: 'white',
                      textDecoration: 'none',
                    }}
                  >
                    {VendorsSubtitle}
                  </Typography>
                )}
              </Box>
            </Link>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', lg: 'flex' }, ml: 2 }}>
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

            {/* Mobile: push everything after the title (hamburger's Menu, nothing here) to the right.
                Desktop: nav buttons already have flexGrow: 1 above and fill this role instead. */}
            <Box sx={{ display: { xs: 'flex', lg: 'none' }, flexGrow: 1 }} />

            {isDevelopment() && (
              <Box sx={{ display: { xs: 'none', lg: 'flex' } }}>
                <DevTools />
              </Box>
            )}
            {isDevOrPreview() && (
              <Box sx={{ display: { xs: 'none', lg: 'flex' } }}>
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