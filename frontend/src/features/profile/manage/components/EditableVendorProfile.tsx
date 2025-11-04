'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { getDefaultBio } from '@/features/profile/common/utils/bio';
import IconButton from '@mui/material/IconButton';
import { useNotification } from '@/contexts/NotificationContext';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import VendorProfile from '@/features/profile/common/components/VendorProfile';
import { Vendor } from '@/types/vendor';
import MenuView from './MenuView';
import EditFormView, { VendorFormData } from './EditFormView';


const sections = [
  { id: 'business', label: 'Business info', required: true },
  { id: 'about', label: 'About', required: true },
  { id: 'services', label: 'Services you provide', required: true },
  { id: 'pricing', label: 'Pricing', required: false },
  { id: 'image', label: 'Business image', required: false },
];

const DRAWER_WIDTH = 400;

interface VendorEditProfileProps {
  vendor: Vendor;
}

export default function VendorEditProfile({ vendor }: VendorEditProfileProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null); // null = menu view
  const [completedSections, setCompletedSections] = useState<string[]>(['business']);
  const { addNotification } = useNotification();

  // Form state - initialize with vendor data
  const [formData, setFormData] = useState<VendorFormData>({
    business_name: vendor.business_name || '',
    location: vendor.city || '',
    travels_world_wide: vendor.travels_world_wide || false,
    website: vendor.website || '',
    instagram: vendor.instagram || '',
    google_maps_place: vendor.google_maps_place || '',
    description: vendor.description || '',
    bridal_hair_price: vendor.bridal_hair_price,
    bridal_makeup_price: vendor.bridal_makeup_price,
    bridal_hair_makeup_price: vendor.bridal_hair_makeup_price,
    bridesmaid_hair_price: vendor.bridesmaid_hair_price,
    bridesmaid_makeup_price: vendor.bridesmaid_makeup_price,
    bridesmaid_hair_makeup_price: vendor.bridesmaid_hair_makeup_price,
    cover_image: vendor.cover_image,
    images: vendor.images || [],
    tags: vendor.tags || [],
  });

  // Compute resolvedLocation for default bio
  const resolvedLocation = formData.location || vendor.city || vendor.region || vendor.state || vendor.country || '';

  // Create preview vendor object
  const previewVendor: Vendor = {
    ...vendor,
    business_name: formData.business_name,
    city: formData.location,
    travels_world_wide: formData.travels_world_wide,
    website: formData.website,
    instagram: formData.instagram,
    google_maps_place: formData.google_maps_place,
    description: formData.description?.trim()
      ? formData.description
      : getDefaultBio({
          businessName: vendor.business_name || null,
          tags: vendor.tags,
          location: resolvedLocation
        }),
    bridal_hair_price: formData.bridal_hair_price,
    bridal_makeup_price: formData.bridal_makeup_price,
    bridal_hair_makeup_price: formData.bridal_hair_makeup_price,
    bridesmaid_hair_price: formData.bridesmaid_hair_price,
    bridesmaid_makeup_price: formData.bridesmaid_makeup_price,
    bridesmaid_hair_makeup_price: formData.bridesmaid_hair_makeup_price,
    cover_image: formData.cover_image,
  };
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleBackToMenu = () => {
    setActiveSection(null);
  };

  const markSectionComplete = (sectionId: string) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections([...completedSections, sectionId]);
    }
  };

  const handleSave = async () => {
  try {
    // const response = await fetch('/api/vendor/update-draft', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     vendorId: vendor.id,
    //     draftData: formData,
    //   }),
    // });
    
    // if (!response.ok) throw new Error('Failed to save draft');
    
    addNotification('Changes saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving draft:', error);
  }
  };

  const handlePublish = async () => {
    // TODO: don't forget to remove vendor tags
    // Move draft_data to main fields and set is_published = true
    // await fetch('/api/vendor/publish', {
    //   method: 'POST',
    //   body: JSON.stringify({ vendorId: vendor.id }),
    // });
    addNotification('Changes published successfully!', 'success');
  };

  // Menu and EditForm views are moved to separate components

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {activeSection ? sections.find(s => s.id === activeSection)?.label : 'Edit Profile'}
            </Typography>
            {isMobile && mobileOpen && (
              <IconButton color="inherit" onClick={handleDrawerToggle}>
                <CloseIcon />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        {isMobile && <Toolbar />}
        {activeSection ? (
          <EditFormView
            activeSection={activeSection}
            sections={sections}
            formData={formData}
            setFormData={setFormData}
            handleBackToMenu={handleBackToMenu}
            handleSave={handleSave}
            markSectionComplete={markSectionComplete}
            vendorIdentifier={vendor.slug ?? vendor.id}
          />
        ) : (
          <MenuView
            sections={sections}
            completedSections={completedSections}
            onSectionClick={handleSectionClick}
            onPublish={handlePublish}
          />
        )}
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isMobile && <Toolbar />}

        {/* Preview */}
        <Box sx={{
          flexGrow: 1,
          overflow: 'auto',
          bgcolor: 'grey.100',
          position: 'relative'
        }}>
          {/* Preview Header Banner */}
          <Box sx={{
            bgcolor: 'info.main',
            color: 'white',
            py: 1.5,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            boxShadow: 1,
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'success.light',
              animation: 'pulse 2s infinite'
            }} />
            <Typography variant="body2" fontWeight="medium">
              Preview Mode - Changes appear instantly
            </Typography>
          </Box>

          {/* Preview Content with frame effect */}
          <Box sx={{
            p: 3,
            maxWidth: 1400,
            mx: 'auto'
          }}>
            <Box sx={{
              bgcolor: 'white',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}>
              <VendorProfile vendor={previewVendor} />
            </Box>
          </Box>

          {/* Add pulse animation */}
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </Box>
      </Box>
    </Box>
  );
}