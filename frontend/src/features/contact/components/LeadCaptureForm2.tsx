import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
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
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import Tooltip from '@mui/material/Tooltip';
import FilterChip from '@/components/ui/FilterChip';
import ToggleButtonGroup, { toggleButtonGroupClasses } from '@mui/material/ToggleButtonGroup';
import ToggleButton, { toggleButtonClasses } from '@mui/material/ToggleButton';
import { styled } from '@mui/material/styles';
import { VendorSpecialty, VendorSpecialtyDisplayNames } from '@/types/tag';

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

interface FormData {
  // Step 1: Services & Event Details
  services: string[];
  location: string;
  peopleCount: string;
  flexibleCount: boolean;
  weddingDate: string;
  dateNotSet: boolean;

  // Step 2: Style & Preferences
  makeupStyles: string[];
  languages: string;
  budget: string;

  // Step 3: Contact Info (After Investment)
  name: string;
  email: string;
  additionalDetails: string;
}

interface FormErrors {
  [key: string]: string | null;
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  gap: '2rem',
  [`& .${toggleButtonGroupClasses.firstButton}, & .${toggleButtonGroupClasses.middleButton}`]:
  {
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
  },
  [`& .${toggleButtonGroupClasses.lastButton}, & .${toggleButtonGroupClasses.middleButton}`]:
  {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderLeft: `1px solid ${theme.palette.divider}`,
  },
  [`& .${toggleButtonGroupClasses.lastButton}.${toggleButtonClasses.disabled}, & .${toggleButtonGroupClasses.middleButton}.${toggleButtonClasses.disabled}`]:
  {
    borderLeft: `1px solid ${theme.palette.action.disabledBackground}`,
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
    weddingDate: '',
    dateNotSet: false,

    // Step 2: Preferences
    makeupStyles: [],
    languages: '',
    budget: '',

    // Step 3: Contact Info
    name: '',
    email: '',
    additionalDetails: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // 3-step process with personal info last for psychological commitment
  const steps = ['Event Details', 'Style Preferences', 'Your Info'];

  const serviceOptions = vendor.services && vendor.services.length > 0
    ? vendor.services.map(
      (service: VendorSpecialty) => VendorSpecialtyDisplayNames[service]
    )
    : ["Hair", "Makeup"];


  const makeupStyleOptions = [
    'Natural/Soft Glam',
    'Bold/Dramatic',
    'South Asian style',
    'Thai style',
    'Korean style',
    'Not sure'
  ];

  const languageOptions = [
    'English',
    'Hindi',
    'Punjabi',
    'Tamil',
    'Telugu',
    'Bengali',
    'Gujarati',
    'Marathi',
    'Urdu',
    'Korean',
    'Chinese (Mandarin)',
    'Chinese (Cantonese)',
    'Thai',
    'Vietnamese',
    'Tagalog',
    'Japanese',
    'Indonesian',
    'Malay'
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

  const handleSelectChange = (name: string) => (event: any) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleMultiSelectChange = (field: keyof FormData) => (event: any) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleCheckboxChange = (field: keyof FormData, value: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentValues = formData[field] as string[];
    if (event.target.checked) {
      setFormData(prev => ({
        ...prev,
        [field]: [...currentValues, value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: currentValues.filter(item => item !== value)
      }));
    }
  };

  // Fixed validation function
  const validateCurrentStep = (): boolean => {
    const newErrors: FormErrors = {};

    switch (activeStep) {
      case 0: // Event Details
        if (formData.services.length === 0) {
          newErrors.services = 'Please select at least one service';
        }
        if (!formData.location.trim()) {
          newErrors.location = 'Wedding location helps us provide accurate availability';
        }
        if (!formData.peopleCount.trim()) {
          newErrors.peopleCount = 'Please enter the number of people needing services';
        } else {
          const count = parseInt(formData.peopleCount);
          if (isNaN(count) || count < 1) {
            newErrors.peopleCount = 'Please enter a valid number (1 or more)';
          }
        }
        // Wedding date is now always required
        if (!formData.weddingDate.trim()) {
          newErrors.weddingDate = 'Please enter your wedding date';
        }
        break;
      case 1: // Style Preferences - All optional but encourage completion
        // No required fields, but we can encourage completion
        break;
      case 2: // Contact Info - Required for final submission
        if (!formData.name.trim()) newErrors.name = 'Please enter your name';
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required to receive your personalized quote';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
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

  const submitToHubSpot = async (data: FormData): Promise<boolean> => {
    // Replace with your actual HubSpot portal ID and form GUID
    const portalId = 'YOUR_PORTAL_ID';
    const formGuid = 'YOUR_FORM_GUID';

    const submitData = new FormData();
    submitData.append('email', data.email);
    submitData.append('firstname', data.name);
    submitData.append('wedding_date', data.weddingDate);
    submitData.append('location', data.location);
    submitData.append('people_count', data.peopleCount);
    submitData.append('flexible_count', data.flexibleCount ? 'true' : 'false');
    submitData.append('makeup_styles', data.makeupStyles.join(', '));
    submitData.append('services', data.services.join(', '));
    submitData.append('languages', data.languages);
    submitData.append('budget', data.budget);
    submitData.append('additional_details', data.additionalDetails);

    // Add vendor information
    submitData.append('vendor_name', vendor.name);
    submitData.append('vendor_slug', vendor.slug);
    if (vendor.email) {
      submitData.append('vendor_email', vendor.email);
    }

    try {
      const response = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`, {
        method: 'POST',
        body: submitData,
        mode: 'cors'
      });

      return response.ok;
    } catch (error) {
      console.error('HubSpot submission error:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);

    try {
      const success = await submitToHubSpot(formData);

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
          wedding_date: formData.dateNotSet ? 'Date not set yet' : formData.weddingDate,
          is_modal: isModal,
        });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // No early submission - build commitment through the process
  const hasCompletedInvestment = () => {
    return activeStep >= 1; // After they've shared event details and preferences
  };

  // Success state
  if (submitted) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: isMobile ? 2 : 4, mb: 4 }}>
          {isModal && onClose && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <IconButton onClick={onClose} size="small">
                <Close />
              </IconButton>
            </Box>
          )}
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h3" component="h2" gutterBottom color="success.main">
              Request Sent Successfully! 🎉
            </Typography>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
              {vendor.name} has received your inquiry
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You'll receive a personalized quote and consultation within 24 hours.
              Check your email (including spam folder) for their response!
            </Typography>
            <Stack direction={isMobile ? 'column' : 'row'} spacing={2} justifyContent="center">
              {onClose && (
                <Button variant="contained" onClick={onClose}>
                  Close
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={() => {
                  setSubmitted(false);
                  setActiveStep(0);
                  setFormData({
                    services: [], // Start with no services selected
                    location: '',
                    peopleCount: '',
                    flexibleCount: false,
                    weddingDate: '',
                    dateNotSet: false,
                    makeupStyles: [],
                    languages: '',
                    budget: '',
                    name: '',
                    email: '',
                    additionalDetails: ''
                  });
                }}
              >
                Contact Another Vendor
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Container>
    );
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 500 }}>
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
              </Box>

              <Box>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 500 }}>
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
                />
              </Box>

              <Box>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 500 }}>
                  How many people need hair or makeup (including the bride)? *
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                  <TextField
                    type="number"
                    name="peopleCount"
                    value={formData.peopleCount}
                    onChange={handleInputChange}
                    placeholder="Enter a number"
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
              </Box>
            </Stack>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Let's personalize your experience 💄
            </Typography>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                  What's your style inspiration? ✨
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select all that speak to you - this helps us match your vision
                </Typography>
                <Grid container spacing={1}>
                  {makeupStyleOptions.map((style) => (
                    <Grid key={style} size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.makeupStyles.includes(style)}
                            onChange={handleCheckboxChange('makeupStyles', style)}
                            sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                            {style}
                          </Typography>
                        }
                        sx={{
                          m: 0,
                          '& .MuiFormControlLabel-label': {
                            fontSize: '0.9rem'
                          }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                  Language preferences 🗣️
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Languages you'd prefer</InputLabel>
                  <Select
                    multiple
                    value={formData.languages ? formData.languages.split(', ').filter(lang => lang.trim() !== '') : []}
                    onChange={(event) => {
                      const values = event.target.value as string[];
                      setFormData(prev => ({
                        ...prev,
                        languages: values.join(', ')
                      }));
                    }}
                    input={<OutlinedInput label="Languages you'd prefer" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {languageOptions.map((language) => (
                      <MenuItem key={language} value={language}>
                        {language}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <TextField
                fullWidth
                name="budget"
                label="Budget Range"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="e.g., $800-1200, Around $1500, Flexible"
                helperText="Your estimated budget for hair & makeup services (optional)"
              />
            </Stack>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Almost there! Let's connect you 🎉
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Just your contact details and {vendor.name} will send you a personalized quote within 24 hours.
            </Typography>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    name="name"
                    label="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    placeholder="e.g., Sarah Chen"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={!!errors.email}
                    helperText={errors.email || "Your personalized quote will be sent here"}
                    placeholder="sarah@email.com"
                  />
                </Grid>
              </Grid>

              <Box>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 500 }}>
                  When is your wedding? *
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                  <TextField
                    required
                    name="weddingDate"
                    label="Wedding Date"
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
                        checked={formData.dateNotSet}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            dateNotSet: e.target.checked
                          }));
                        }}
                      />
                    }
                    label="Date is flexible"
                    sx={{ mt: isMobile ? 0 : 1 }}
                  />
                </Box>
              </Box>

              <TextField
                fullWidth
                name="additionalDetails"
                label="Anything else you'd like to share?"
                multiline
                rows={3}
                value={formData.additionalDetails}
                onChange={handleInputChange}
                placeholder="Special requests, style inspiration, specific traditions, timeline concerns, or questions for the artist..."
              />
            </Stack>
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
        <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
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
        </Paper>

        {/* Form Content */}
        <Paper elevation={1} sx={{ p: isMobile ? 3 : 4, bgcolor: 'background.paper', borderRadius: 2 }}>
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
                  `Get My Quote from ${vendor.name}`
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                size="large"
                sx={{ fontWeight: 600 }}
              >
                Continue
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LeadCaptureForm;