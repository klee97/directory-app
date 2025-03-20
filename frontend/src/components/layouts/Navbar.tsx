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
import { Collapse, useMediaQuery } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

const pages = ["About", "Contact", "FAQ", "Recommend"];
const resources = ["Blog"];

const Title = 'HAIR AND MAKEUP';

export default function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElResources, setAnchorElResources] = React.useState<null | HTMLElement>(null);
  const [resourcesExpanded, setResourcesExpanded] = React.useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  React.useEffect(() => {
    // Close menus when screen size changes
    if (anchorElNav) {
      setAnchorElNav(null);
    }
  }, [isMobile]);

  const { mode, setMode } = useColorScheme();
  if (!mode) {
    return null;
  }
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    console.log("Open menu");
    setAnchorElNav(event.currentTarget);
    setResourcesExpanded(false);
  };

  const handleCloseNavMenu = () => {
    console.log("Close menu");
    setAnchorElNav(null);
    setResourcesExpanded(false);
  };

  const handleOpenResourcesMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElResources(event.currentTarget);
    setResourcesExpanded(true);
  };

  const handleCloseResourcesMenu = () => {
    setAnchorElResources(null);
    setResourcesExpanded(false);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
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
              color='primary'
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
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography component="a" sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }} href={`/${page.toLowerCase()}`}>{page}</Typography>
                </MenuItem>
              ))}
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
                        onClick={handleCloseNavMenu}
                        sx={{ pl: 2 }}
                      >
                        <Typography component="a" sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }} href={`/${resource.toLowerCase()}`}>
                          {resource}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Box>
                </Collapse>
              </Box>
            </Menu>
          </Box>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image src={Logo.src} width={40} height={40} alt={"logo"} style={{ marginRight: '16px' }}/>
            <Typography
              variant="h6"
              noWrap
              component="a"
              sx={{
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
            {pages.map((page) => (
              <Link style={{ textDecoration: 'none' }} color="inherit" key={page} href={`/${page.toLowerCase()}`} onClick={handleCloseNavMenu}>
                <Button sx={{ my: 2, color: 'white', display: 'block' }}>
                  {page}
                </Button>
              </Link>
            ))}
            <Button
              key="Resources"
              onClick={handleOpenResourcesMenu}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Resources
            </Button>
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
                <MenuItem key={resource} onClick={handleCloseResourcesMenu}>
                  <Typography component="a" sx={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }} href={`/blog`}>{resource}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          {process.env.NODE_ENV === 'development' && (
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
        </Toolbar>
      </Container>
    </AppBar>
  );
}
