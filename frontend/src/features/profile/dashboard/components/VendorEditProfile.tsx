'use client';

import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useNotification } from '@/contexts/NotificationContext';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import VendorProfile from '@/features/profile/common/components/VendorProfile';
import { Vendor, VendorTag } from '@/types/vendor';
import MenuView from './MenuView';
import EditFormView from './EditFormView';
import { createOrUpdateDraft, loadUnpublishedDraft, publishDraft } from '../api/updateDrafts';
import { vendorToFormData } from '@/lib/profile/vendorToFormTranslator';
import { VendorFormData } from '@/types/vendorFormData';
import { draftToFormData } from '@/lib/profile/draftToFormTranslator';
import CircularProgress from '@mui/material/CircularProgress';
import { useSectionCompletion } from '../hooks/updateSectionStatus';
import { SECTIONS } from './Section';
import { normalizeUrl } from '@/lib/profile/normalizeUrl';
import UnsavedChangesModal from './UnsavedChangesModal';
import { VendorMedia } from '@/types/vendorMedia';
import VendorFeedbackPopup from '@/features/contact/components/VendorFeedbackPopup';
import DesktopPromptOverlay from '@/components/ui/overlays/DesktopPromptOverlay';

const DRAWER_WIDTH = 400;

interface VendorEditProfileProps {
  vendor: Vendor;
  tags: VendorTag[];
  userId: string;
}

export default function VendorEditProfile({ vendor, tags, userId }: VendorEditProfileProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [smallScreenMenuOpen, setSmallScreenMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null); // null = menu view
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [feedbackTriggered, setFeedbackTriggered] = useState(false);

  const { addNotification } = useNotification();

  const [draftId, setDraftId] = useState<string | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const initialFormData = useMemo(() => vendorToFormData(vendor), [vendor.id]);
  const [formData, setFormData] = useState<VendorFormData>(
    initialFormData // Show vendor data immediately. Replace once draft loads
  );
  const [lastSavedData, setLastSavedData] = useState<VendorFormData>(
    initialFormData
  );
  const { completedSections, inProgressSections } = useSectionCompletion(SECTIONS, formData);

  useEffect(() => {
    async function checkForDraft() {
      try {
        setIsLoadingDraft(true);

        // Only load if there's an unpublished draft
        const draft = await loadUnpublishedDraft(vendor.id, userId);

        if (draft) {
          // Found unpublished work - load it
          setDraftId(draft.id);
          const formData = draftToFormData(draft);
          setFormData(formData);
          setLastSavedData(formData);
          setHasUnpublishedChanges(true);
        }
        // If no draft, formData already has vendor data from initialization
      } catch (error) {
        console.error('Error loading draft:', error);
        addNotification('Failed to load draft. Using live profile data.', 'warning');
      } finally {
        setIsLoadingDraft(false);
      }
    }

    checkForDraft();
  }, [vendor.id, userId]);

  // Create preview vendor object
  const previewVendor: Vendor = {
    ...vendor,
    business_name: formData.business_name,
    city: formData.locationResult?.address?.city || '',
    state: formData.locationResult?.address?.state || '',
    country: formData.locationResult?.address?.country || '',
    latitude: formData.locationResult?.lat || null,
    longitude: formData.locationResult?.lon || null,
    travels_world_wide: formData.travels_world_wide,
    website: normalizeUrl(formData.website),
    instagram: formData.instagram,
    google_maps_place: formData.google_maps_place,
    description: formData.description,
    bridal_hair_price: formData.bridal_hair_price,
    bridal_makeup_price: formData.bridal_makeup_price,
    bridal_hair_makeup_price: formData["bridal_hair_&_makeup_price"],
    bridesmaid_hair_price: formData.bridesmaid_hair_price,
    bridesmaid_makeup_price: formData.bridesmaid_makeup_price,
    bridesmaid_hair_makeup_price: formData["bridesmaid_hair_&_makeup_price"],
    cover_image: isLoadingDraft ? null : formData.cover_image as Partial<VendorMedia> | null, // Show existing cover image until draft loads
    images: formData.cover_image ? [formData.cover_image as Partial<VendorMedia>] : [],
    tags: formData.tags,
  };

  const handleDrawerToggle = () => {
    setSmallScreenMenuOpen(!smallScreenMenuOpen);
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleBackToMenu = () => {
    // Check if current formData differs from savedDraftData
    const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(lastSavedData);

    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      setActiveSection(null);
    }
  };

  const handleDiscardChanges = () => {
    setFormData(lastSavedData);
    setShowUnsavedModal(false);
    setActiveSection(null);
  };

  const handleSave = async (dataToSave: VendorFormData) => {
    try {
      const draft = await createOrUpdateDraft(dataToSave, vendor.id, userId, draftId);
      setDraftId(draft.id);
      setFormData(dataToSave);
      setLastSavedData(dataToSave);
      setHasUnpublishedChanges(true);
      addNotification('Changes saved!', 'success');
    } catch (error) {
      console.error('Error saving:', error);
      addNotification('Failed to save changes', 'error');
    }
  };


  const handlePublish = async () => {
    if (!userId) {
      addNotification('User not authenticated', 'error');
      return;
    }
    let result;
    if (!draftId) {
      // No draft exists, save first then publish
      const draft = await createOrUpdateDraft(formData, vendor.id, userId, draftId);
      result = await publishDraft(draft.id);
    } else {
      result = await publishDraft(draftId);
    }
    if (result.error) {
      console.error(result.error);
      addNotification(`Failed to publish: ${result.error}`, 'error');
      return;
    } else {
      setHasUnpublishedChanges(false);
      setLastSavedData(formData);
      addNotification('Changes published successfully!', 'success');
      setFeedbackTriggered(true);
    }
  };

  return (
    <>
      <DesktopPromptOverlay />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Mobile App Bar */}
        {isSmallScreen && (
          <AppBar position="fixed" sx={{
            bgcolor: 'background.vendorNavbar',
            color: 'white',
            zIndex: (theme) => theme.zIndex.drawer + 1
          }}>
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
                {activeSection ? SECTIONS.find(s => s.id === activeSection)?.label : 'Edit Profile'}
              </Typography>
              {isSmallScreen && smallScreenMenuOpen && (
                <IconButton color="inherit" onClick={handleDrawerToggle}>
                  <CloseIcon />
                </IconButton>
              )}
            </Toolbar>
          </AppBar>
        )}

        {/* Sidebar Drawer */}
        <Drawer
          variant={isSmallScreen ? 'temporary' : 'permanent'}
          open={isSmallScreen ? smallScreenMenuOpen : true}
          onClose={handleDrawerToggle}
          sx={{
            position: 'relative',
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
              top: (theme) => theme.mixins.toolbar.minHeight,
              height: (theme) => `calc(100% - ${theme.mixins.toolbar.minHeight}px)`,
            },
          }}
        >
          {activeSection ? (
            <EditFormView
              activeSection={activeSection}
              sections={SECTIONS}
              formData={formData}
              setFormData={setFormData}
              handleBackToMenu={handleBackToMenu}
              handleSave={handleSave}
              vendorSlug={vendor.slug!}
              vendorId={vendor.id}
              tags={tags}
            />
          ) : (
            <MenuView
              inProgressSections={inProgressSections}
              sections={SECTIONS}
              completedSections={completedSections}
              onSectionClick={handleSectionClick}
              onPublish={handlePublish}
              hasUnpublishedChanges={hasUnpublishedChanges}
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
          {/* Preview */}
          <Box sx={{
            flexGrow: 1,
            overflow: 'auto',
            bgcolor: 'grey.200',
            position: 'relative'
          }}>
            {/* Preview Header Banner */}
            <Box sx={{
              bgcolor: 'grey.500',
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
              {isLoadingDraft ? (
                <>
                  <CircularProgress size={16} sx={{ color: 'white' }} />
                  <Typography variant="body2" fontWeight="medium">
                    Checking for draft changes...
                  </Typography>
                </>
              ) : (
                <>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.light',
                    animation: 'pulse 2s infinite'
                  }} />
                  <Typography variant="body2" fontWeight="medium">
                    Preview Mode - Publish to make your changes live
                  </Typography>
                </>
              )}
            </Box>

            {/* Preview Content with frame effect */}
            <Box sx={{
              p: 3,
              bgcolor: 'background.back',
              maxWidth: 1400,
              mx: 'auto'
            }}>
              <Box sx={{
                borderRadius: 2,
                bgcolor: 'background.default',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                p: 2
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
      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        open={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onKeepEditing={() => setShowUnsavedModal(false)}
        onDiscardChanges={handleDiscardChanges}
      />
      <VendorFeedbackPopup
        vendorId={vendor.id}
        businessName={vendor.business_name || ''}
        triggerText={"Your changes are now published."}
        trigger={feedbackTriggered}
        onDismiss={() => setFeedbackTriggered(false)}
      />
    </>
  );
}