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

interface LeadCaptureFormProps {
  onClose?: () => void;
  vendor: {
    name: string;
    slug: string;
    services: string[];
    id: string;
    email?: string;
  };
  isModal?: boolean;
}

interface FormData {
  // Step 1: Services
  services: string[];

  // Step 2: Location & Guest Count
  location: string;
  partySize: string;

  // Step 3: Skills
  makeupStyles: string[];
  languages: string[];

  // Step 4: Personal Details
  name: string;
  email: string;
  weddingDate: string;
  budget: string;
  additionalDetails: string;
}

interface FormErrors {
  [key: string]: string | null;
}

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
    services: vendor.services || [],
    location: '',
    partySize: '',
    makeupStyles: [],
    languages: [],
    name: '',
    email: '',
    weddingDate: '',
    budget: '',
    additionalDetails: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Update services when vendor changes
  useEffect(() => {
    if (vendor.services && vendor.services.length > 0) {
      setFormData(prev => ({
        ...prev,
        services: vendor.services
      }));
    }
  }, [vendor.services]);

  const steps = ['Services', 'Location & Size', 'Makeup Styles', 'Contact Info'];

  const serviceOptions = [
    'Hair',
    'Makeup'
  ];

  const guestCountOptions = [
    '1-25 guests',
    '26-50 guests',
    '51-100 guests',
    '101-200 guests',
    '201-300 guests',
    '300+ guests',
    'Still deciding on guest list',
    'Flexible depending on venue'
  ];

  const makeupStyles = [
    'Thai',
    'South Asian',
    'Soft glam',
    'Natural',
    'Not sure yet',
  ]
  const ceremonyTypes = [
    'Traditional Only',
    'Western Only',
    'Fusion (Traditional + Western)',
    'Multiple Ceremonies',
    'Still Deciding'
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

  const validateCurrentStep = (): boolean => {
    const newErrors: FormErrors = {};

    switch (activeStep) {
      case 0: // Services
        if (formData.services.length === 0) {
          newErrors.services = 'Please select at least one service';
        }
        break;
      case 1: // Location & Guest Count
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.partySize) newErrors.guestCount = 'Guest count is required';
        break;
      case 2: // Cultural Details
        if (formData.makeupStyles.length === 0) {
          newErrors.culturalBackground = 'Please select your cultural background';
        }
        break;
      case 3: // Personal Details
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email';
        }
        if (!formData.weddingDate.trim()) newErrors.weddingDate = 'Wedding date is required';
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
    submitData.append('party_size', data.partySize);
    submitData.append('makeup_styles', data.makeupStyles.join(', '));
    submitData.append('services', data.services.join(', '));
    submitData.append('languages', data.languages.join(', '));
    submitData.append('budget', data.budget);
    submitData.append('additional_details', data.additionalDetails);

    // Add vendor information
    submitData.append('vendor_name', vendor.name);
    submitData.append('vendor_slug', vendor.slug);
    submitData.append('vendor_services', vendor.services.join(', '));
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
          party_size: formData.partySize,
          makeup_styles: formData.makeupStyles.join(', '),
          languages: formData.languages.join(', '),
          budget: formData.budget,
          wedding_date: formData.weddingDate,
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
              Message sent to {vendor.name}!
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your inquiry has been sent
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {vendor.name} will receive your wedding details and contact you directly within 24-48 hours.
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
                    services: vendor.services || [],
                    location: '',
                    partySize: '',
                    makeupStyles: [],
                    languages: [],
                    name: '',
                    email: '',
                    weddingDate: '',
                    budget: '',
                    additionalDetails: ''
                  });
                }}
              >
                Submit Another Request
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
            <Typography variant="h4" gutterBottom>
              What services do you need for your wedding?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Select all that apply. We'll match you with vendors who specialize in Asian weddings.
            </Typography>
            <FormControl fullWidth error={!!errors.services}>
              <InputLabel>Select Services *</InputLabel>
              <Select
                multiple
                value={formData.services}
                onChange={handleMultiSelectChange('services')}
                input={<OutlinedInput label="Select Services *" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value: string) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {serviceOptions.map((service) => (
                  <MenuItem key={service} value={service}>
                    {service}
                  </MenuItem>
                ))}
              </Select>
              {errors.services && (
                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                  {errors.services}
                </Typography>
              )}
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Tell us about your wedding location and size
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Don't worry if you're still deciding - we can work with flexible plans too.
            </Typography>
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                name="location"
                label="Wedding Location/City"
                value={formData.location}
                onChange={handleInputChange}
                error={!!errors.location}
                helperText={errors.location}
                placeholder="e.g., Los Angeles, CA or 'Still deciding between SF and LA'"
                variant="outlined"
              />

              <FormControl fullWidth error={!!errors.partySize}>
                <InputLabel>Number of people requiring services</InputLabel>
                <Select
                  value={formData.partySize}
                  onChange={handleSelectChange('partySize')}
                  label="Number of people requiring services"
                >
                  {guestCountOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {errors.partySize && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {errors.partySize}
                  </Typography>
                )}
              </FormControl>
            </Stack>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Help us understand your cultural preferences
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              This helps us match you with vendors who understand your traditions and can bring your vision to life.
            </Typography>
            <Stack spacing={3}>
              <FormControl fullWidth error={!!errors.culturalBackground}>
                <InputLabel>Makeup Styles</InputLabel>
                <Select
                  multiple
                  value={formData.makeupStyles}
                  onChange={handleMultiSelectChange('makeupStyles')}
                  input={<OutlinedInput label="Cultural Background *" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value: string) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {makeupStyles.map((style) => (
                    <MenuItem key={style} value={style}>
                      {style}
                    </MenuItem>
                  ))}
                </Select>
                {errors.makeupStyles && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {errors.makeupStyles}
                  </Typography>
                )}
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Preferred Languages (Optional)</InputLabel>
                <Select
                  multiple
                  value={formData.languages}
                  onChange={handleMultiSelectChange('languages')}
                  input={<OutlinedInput label="Preferred Languages (Optional)" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value: string) => (
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
            </Stack>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Finally, let's get your contact details
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We'll use this information to send you personalized vendor recommendations. It's okay if some details are still flexible!
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
                    helperText={errors.email}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    name="weddingDate"
                    label="Wedding Date"
                    value={formData.weddingDate}
                    onChange={handleInputChange}
                    error={!!errors.weddingDate}
                    helperText={errors.weddingDate}
                    placeholder="e.g., 'June 2024', 'Fall 2025', or 'Flexible - looking at 2024-2025'"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Budget Estimate</InputLabel>
                    <Select
                      value={formData.budget}
                      onChange={handleSelectChange('budget')}
                      label="Budget Estimate (Optional)"
                    >
                      {budgetRanges.map((range) => (
                        <MenuItem key={range} value={range}>
                          {range}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                name="additionalDetails"
                label="Additional Details (Optional)"
                multiline
                rows={3}
                value={formData.additionalDetails}
                onChange={handleInputChange}
                placeholder="Special requirements, style preferences, specific traditions you want to include..."
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

        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: isMobile ? 3 : 4,
            mb: 3,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderTop: 4,
            borderColor: 'primary.main'
          }}
        >
          <Typography
            variant={isMobile ? "h3" : "h2"}
            component="h1"
          >
            Contact {vendor.name}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
          >
            Tell {vendor.name} about your wedding so they can provide you with a personalized quote and recommendations.
          </Typography>
        </Paper>

        {/* Stepper */}
        <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel={!isMobile}
            sx={{
              '& .MuiStepLabel-root .Mui-completed': {
                color: 'success.main',
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: 'primary.main',
              },
              '& .MuiStepConnector-line': {
                borderColor: 'divider',
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
        <Paper elevation={2} sx={{ p: isMobile ? 3 : 4, bgcolor: 'background.paper' }}>
          {errors.submit && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errors.submit}
            </Alert>
          )}

          {renderStepContent()}

          {/* Navigation */}
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Submitting...
                  </>
                ) : (
                  'Contact ' + vendor.name
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                Next
              </Button>
            )}
          </Box>

          {/* Bottom text */}
          {activeStep === steps.length - 1 && (
            <Typography
              variant="body2"
              align="center"
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              {vendor.name} will receive your details and contact you directly within 24-48 hours.
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default LeadCaptureForm;