import React, { useState } from 'react';
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
import Grid from '@mui/material/Grid';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ArrowForward from '@mui/icons-material/ArrowForward';
import ArrowBack from '@mui/icons-material/ArrowBack';

interface FormData {
  // Step 1: Services
  services: string[];
  
  // Step 2: Location & Guest Count
  location: string;
  guestCount: string;
  
  // Step 3: Cultural Preferences (Asian-specific)
  culturalBackground: string[];
  ceremonyType: string;
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

const LeadCaptureForm: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    services: [],
    location: '',
    guestCount: '',
    culturalBackground: [],
    ceremonyType: '',
    languages: [],
    name: '',
    email: '',
    weddingDate: '',
    budget: '',
    additionalDetails: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const steps = ['Services', 'Location & Size', 'Cultural Details', 'Contact Info'];

  const serviceOptions = [
    'Hair & Makeup',
    'Photography',
    'Videography',
    'Catering',
    'DJ/Music',
    'Venue',
    'Flowers',
    'Decoration',
    'Wedding Planning',
    'Henna Artist',
    'Traditional Attire',
    'Cultural Entertainment'
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

  const culturalBackgrounds = [
    'Indian',
    'Pakistani',
    'Bangladeshi',
    'Sri Lankan',
    'Chinese',
    'Korean',
    'Japanese',
    'Thai',
    'Vietnamese',
    'Filipino',
    'Indonesian',
    'Malaysian',
    'Mixed Heritage',
    'Other Asian'
  ];

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

  const budgetRanges = [
    'Under $5,000',
    '$5,000 - $15,000',
    '$15,000 - $30,000',
    '$30,000 - $50,000',
    '$50,000 - $100,000',
    'Over $100,000',
    'Still researching costs',
    'Flexible - depends on venue/vendors',
    'Prefer not to say'
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
        if (!formData.guestCount) newErrors.guestCount = 'Guest count is required';
        break;
      case 2: // Cultural Details
        if (formData.culturalBackground.length === 0) {
          newErrors.culturalBackground = 'Please select your cultural background';
        }
        if (!formData.ceremonyType) newErrors.ceremonyType = 'Please select ceremony type';
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
    submitData.append('guest_count', data.guestCount);
    submitData.append('services', data.services.join(', '));
    submitData.append('cultural_background', data.culturalBackground.join(', '));
    submitData.append('ceremony_type', data.ceremonyType);
    submitData.append('languages', data.languages.join(', '));
    submitData.append('budget', data.budget);
    submitData.append('additional_details', data.additionalDetails);

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
          event: 'form_submission',
          form_type: 'vendor_recommendations',
          services: formData.services.join(', '),
          location: formData.location,
          guest_count: formData.guestCount,
          cultural_background: formData.culturalBackground.join(', '),
          ceremony_type: formData.ceremonyType,
          languages: formData.languages.join(', '),
          budget: formData.budget,
          wedding_date: formData.weddingDate,
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
        <Box sx={{ mt: isMobile ? 4 : 8, mb: 4 }}>
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h3" component="h2" gutterBottom color="success.main">
              Perfect! We're on it.
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your request has been received
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We'll email you 2-3 qualified vendor recommendations within 24 hours. 
              Our vendors specialize in {formData.culturalBackground.join(' & ')} weddings and understand your cultural needs.
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => {
                setSubmitted(false);
                setActiveStep(0);
                setFormData({
                  services: [],
                  location: '',
                  guestCount: '',
                  culturalBackground: [],
                  ceremonyType: '',
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
              
              <FormControl fullWidth error={!!errors.guestCount}>
                <InputLabel>Expected Number of Guests *</InputLabel>
                <Select
                  value={formData.guestCount}
                  onChange={handleSelectChange('guestCount')}
                  label="Expected Number of Guests *"
                >
                  {guestCountOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {errors.guestCount && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {errors.guestCount}
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
                <InputLabel>Cultural Background *</InputLabel>
                <Select
                  multiple
                  value={formData.culturalBackground}
                  onChange={handleMultiSelectChange('culturalBackground')}
                  input={<OutlinedInput label="Cultural Background *" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value: string) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {culturalBackgrounds.map((background) => (
                    <MenuItem key={background} value={background}>
                      {background}
                    </MenuItem>
                  ))}
                </Select>
                {errors.culturalBackground && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {errors.culturalBackground}
                  </Typography>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors.ceremonyType}>
                <InputLabel>Ceremony Style *</InputLabel>
                <Select
                  value={formData.ceremonyType}
                  onChange={handleSelectChange('ceremonyType')}
                  label="Ceremony Style *"
                >
                  {ceremonyTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {errors.ceremonyType && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {errors.ceremonyType}
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
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Budget Range (Optional)</InputLabel>
                    <Select
                      value={formData.budget}
                      onChange={handleSelectChange('budget')}
                      label="Budget Range (Optional)"
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
      <Box sx={{ mt: isMobile ? 2 : 6, mb: 4 }}>
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
            Get Recommendations from Vendors Perfect for Asian Weddings
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
          >
            Tell us about your wedding and we'll connect you with 2-3 vetted vendors in your area.
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
                  'Get My Recommendations'
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
              We'll email you 2-3 qualified vendor recommendations within 24 hours.
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default LeadCaptureForm;