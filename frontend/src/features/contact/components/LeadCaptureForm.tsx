import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Close from '@mui/icons-material/Close';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import ToggleButtonGroup, { toggleButtonGroupClasses } from '@mui/material/ToggleButtonGroup';
import ToggleButton, { toggleButtonClasses } from '@mui/material/ToggleButton';
import { alpha, styled } from '@mui/material/styles';
import { VendorSpecialty, VendorSpecialtyDisplayNames } from '@/types/tag';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { submitToAirtable } from '@/features/contact/api/airtable';

interface LeadCaptureFormProps {
  onClose?: () => void;
  vendor: {
    name: string;
    slug: string;
    services: VendorSpecialty[];
    id: string;
    email?: string;
    location: string;
  };
  isModal?: boolean;
}

export interface FormData {
  // Step 1: Services & Event Details
  services: string[];
  peopleCount: string;
  flexibleCount: boolean;

  // Step 2: Event details
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  weddingDate: string;
  flexibleDate: boolean;
  budget: string;
  additionalDetails: string;

  // Step 3: Style & Preferences
  makeupStyles: string[];
  languages: string;
}

interface FormErrors {
  [key: string]: string | null;
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  gap: '12px',
  display: 'flex',
  flexWrap: 'wrap',

  '& .MuiToggleButton-root': {
    textTransform: 'none',
    borderRadius: '12px',
    padding: '12px 20px',
    transition: 'all 0.2s ease-in-out',
    fontWeight: 400, // Start with normal weight
    minWidth: '120px',
    backgroundColor: theme.palette.background.paper, // Clean white background
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,

    // Subtle hover effects
    '&:hover': {
      transform: 'translateY(-1px)', // Reduced from -2px
      boxShadow: theme.shadows[2], // Lighter shadow
      borderColor: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.04), // Very subtle tint
    },

    // Much more subtle selected state
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08), // Light tint instead of solid color
      color: theme.palette.primary.main, // Primary color text instead of white
      borderColor: theme.palette.primary.main,
      fontWeight: 500, // Slightly bolder text

      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.12), // Slightly darker on hover
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows[3],
      },
    },

    '&:focus-visible': {
      outline: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
      outlineOffset: '2px',
    },
  },

  // Override grouped button styles for individual appearance
  [`& .${toggleButtonGroupClasses.firstButton}, & .${toggleButtonGroupClasses.middleButton}, & .${toggleButtonGroupClasses.lastButton}`]: {
    borderRadius: '12px !important',
    border: `1px solid ${theme.palette.divider} !important`,
    margin: 0,
  },

  [`& .${toggleButtonGroupClasses.middleButton}, & .${toggleButtonGroupClasses.lastButton}`]: {
    borderLeft: `1px solid ${theme.palette.divider} !important`,
  },

  // Ensure selected state overrides
  [`& .${toggleButtonClasses.selected}`]: {
    borderColor: `${theme.palette.primary.main} !important`,
  },

  [`& .${toggleButtonClasses.disabled}`]: {
    borderColor: `${theme.palette.action.disabledBackground} !important`,
    opacity: 0.5,
  },
}));

const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
  onClose,
  vendor,
  isModal = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    // Step 1: Event Details
    services: [],
    location: '',
    peopleCount: '',
    flexibleCount: false,


    // Step 2: Preferences
    firstName: '',
    lastName: '',
    email: '',
    weddingDate: '',
    flexibleDate: false,
    budget: '',
    additionalDetails: '',

    // Step 3: Style
    makeupStyles: [],
    languages: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});


  // 2-step process with optional 3rd step for style preferences
  const steps = ['Artist fit', 'Personal details'];

  const serviceOptions = vendor.services && vendor.services.length > 0
    ? vendor.services.map(
      (service: VendorSpecialty) => VendorSpecialtyDisplayNames[service]
    )
    : ["Hair", "Makeup"];

  const makeupStyleOptions = [
    'Natural',
    'Soft Glam',
    'South Asian style',
    'Thai style',
    'Korean style',
    'Other',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: FormErrors = {};

    switch (activeStep) {
      case 0:
        if (formData.services.length === 0) {
          newErrors.services = 'Please select at least one service';
        }
        if (!formData.location.trim()) {
          newErrors.location = 'Wedding location helps artists provide accurate availability';
        }
        if (!formData.peopleCount.trim()) {
          newErrors.peopleCount = 'Please enter the number of people needing services';
        } else {
          const count = parseInt(formData.peopleCount);
          if (isNaN(count) || count < 1) {
            newErrors.peopleCount = 'Please enter a valid number (1 or more)';
          }
        }
        break;
      case 1:
        if (!formData.weddingDate.trim()) {
          newErrors.weddingDate = "Please enter a wedding date";
        }
        if (!formData.firstName.trim()) newErrors.firstName = 'Please enter your first name';
        if (!formData.lastName.trim()) newErrors.lastName = 'Please enter your last name';
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required so the artist can give you a quote.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.budget.trim()) {
          newErrors.budget = "Please enter an estimated budget";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);

    try {
      const success = await submitToAirtable(formData, vendor);

      if (success) {
        setSubmitted(true);
        // Track conversion with GTM
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'vendor_contact_form_submission',
          form_type: 'vendor_contact',
          vendor_name: vendor.name,
          vendor_slug: vendor.slug,
          services: formData.services.join(', '),
          location: formData.location,
          people_count: formData.peopleCount,
          makeup_styles: formData.makeupStyles.join(', '),
          languages: formData.languages,
          budget: formData.budget,
          wedding_date: formData.flexibleDate ? 'Date not set yet' : formData.weddingDate,
          is_modal: isModal,
        });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <CheckCircle sx={{
            fontSize: 80,
            color: 'success.main',
            mb: 2
          }} />
          <Typography
            variant={isMobile ? "h4" : "h3"}
            component="h2"
            color="success.main"
            sx={{ fontWeight: 600 }}
          >
            Request Sent Successfully! 🎉
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ textAlign: 'center', pt: 2 }}>
          <Typography
            variant="body1"
            sx={{
              mb: 2,
              color: 'text.secondary',
              lineHeight: 1.6
            }}
          >
            Your information has been sent and <strong>{vendor.name}</strong> will
            reach out to you directly if it&apos;s a good fit.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={onClose}
            size="large"
            sx={{
              minWidth: 120,
              bgcolor: 'primary.main'
            }}
          >
            Close
          </Button>
        </DialogActions>
      </>
    );
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Grid container paddingTop={4} paddingX={3} spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                  What can {vendor.name} help you with? *
                </Typography>
                <StyledToggleButtonGroup
                  value={formData.services}
                  onChange={(e, newValue) => {
                    // Allow newValue to be empty array or have values
                    setFormData({ ...formData, services: newValue || [] });
                    // Clear error when user makes a selection
                    if (errors.services) {
                      setErrors(prev => ({ ...prev, services: null }));
                    }
                  }}
                  color="primary"
                  aria-label="services"
                >
                  {serviceOptions.map(service => (
                    <ToggleButton key={service} value={service}>
                      {service}
                    </ToggleButton>
                  ))}
                </StyledToggleButtonGroup>
                {errors.services && (
                  <Typography variant="caption" color="error" sx={{ ml: 0, mt: 0.5, display: 'block' }}>
                    {errors.services}
                  </Typography>
                )}
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                  Where is your wedding? *
                </Typography>
                <TextField
                  required
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  error={!!errors.location}
                  helperText={errors.location}
                  variant="outlined"
                  fullWidth
                  placeholder="City and state, or metro area"
                  sx={{ maxWidth: 300 }}
                />
              </Grid>

              <Grid>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                  How many people need hair or makeup, including the bride? *
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                  <TextField
                    type="number"
                    name="peopleCount"
                    value={formData.peopleCount}
                    onChange={handleInputChange}
                    error={!!errors.peopleCount}
                    helperText={errors.peopleCount}
                    slotProps={{ htmlInput: { min: 1 } }}
                    sx={{ minWidth: 150 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.flexibleCount}
                        onChange={(e) =>
                          setFormData({ ...formData, flexibleCount: e.target.checked })
                        }
                      />
                    }
                    label="This number is flexible"
                    sx={{ mt: isMobile ? 0 : 1 }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                  What makeup styles are you interested in?
                </Typography>
                <StyledToggleButtonGroup
                  value={formData.makeupStyles}
                  onChange={(e, newValue) => {
                    // Allow newValue to be empty array or have values
                    setFormData({ ...formData, makeupStyles: newValue || [] });
                    // Clear error when user makes a selection
                    if (errors.makeupStyles) {
                      setErrors(prev => ({ ...prev, makeupStyles: null }));
                    }
                  }}
                  color="primary"
                  aria-label="makeupStyles"
                >
                  {makeupStyleOptions.map(makeupStyle => (
                    <ToggleButton key={makeupStyle} value={makeupStyle}>
                      {makeupStyle}
                    </ToggleButton>
                  ))}
                </StyledToggleButtonGroup>
                {errors.makeupStyles && (
                  <Typography variant="caption" color="error" sx={{ ml: 0, mt: 0.5, display: 'block' }}>
                    {errors.makeupStyles}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box >
        );

      case 1:
        return (
          <Box>
            <Typography variant="h3" paddingY={2} sx={{ fontWeight: 600 }}>
              Almost there! Add your details to minimize back-and-forth.
            </Typography>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
              Your Name *
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  placeholder="First"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  placeholder="Last"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                  Email Address *
                </Typography>
                <TextField
                  required
                  fullWidth
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="Email"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                  Wedding Date *
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    required
                    name="weddingDate"
                    type="date"
                    value={formData.weddingDate}
                    onChange={handleInputChange}
                    error={!!errors.weddingDate}
                    helperText={errors.weddingDate}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ minWidth: 200 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.flexibleDate}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            flexibleDate: e.target.checked
                          }));
                        }}
                      />
                    }
                    label="Date is flexible"
                    sx={{ mt: isMobile ? 0 : 1 }}
                  />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                  Estimated budget for hair and makeup *
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    type="number"
                    value={formData.budget ? formData.budget.toLocaleString() : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    error={!!errors.budget}
                    helperText={errors.budget}
                    slotProps={{
                      input: { startAdornment: <Typography sx={{ color: 'text.secondary', mr: 0.5 }}>$</Typography> },
                      htmlInput: { min: 0 }
                    }}
                    sx={{ maxWidth: 200 }}
                  />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                  Anything else to add?
                </Typography>
                <TextField
                  fullWidth
                  name="additionalDetails"
                  multiline
                  rows={3}
                  value={formData.additionalDetails}
                  onChange={handleInputChange}
                  placeholder="Describe your vision, special requests, or questions you have."
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'grey.50'
                    }
                  }}
                />
              </Grid>
            </Grid >

          </Box>

        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: isModal ? 2 : (isMobile ? 2 : 6), mb: 4 }}>
        {/* Close button for modal */}
        {isModal && onClose && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        )}

        {/* Progress indicator */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel={!isMobile}
          sx={{
            '& .MuiStepLabel-root .Mui-completed': {
              color: 'success.main',
            },
            '& .MuiStepLabel-root .Mui-active': {
              color: 'primary.main',
            }
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form Content */}
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.submit}
          </Alert>
        )}

        {renderStepContent()}

        {/* Navigation */}
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4, gap: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>

          <Box sx={{ flex: '1 1 auto' }} />

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="large"
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Sending Request...
                </>
              ) : (
                `Get My Quote`
              )}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => {
                handleNext();
              }}
              endIcon={<ArrowForward />}
              size="large"
              sx={{ fontWeight: 600 }}
            >
              Continue
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default LeadCaptureForm;