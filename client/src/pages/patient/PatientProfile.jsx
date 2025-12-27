import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Grid, TextField, MenuItem, FormControl,
  InputLabel, Select, FormControlLabel, Switch, CircularProgress, Alert, Fade,
} from '@mui/material';
import {
  Person, ContactEmergency, LocalHospital, FitnessCenter,
  Restaurant, VerifiedUser, Download,
} from '@mui/icons-material';
import profileService from '../../services/profileService';
import ProgressStepper from '../../components/patient/ProgressStepper';
import AuthCard from '../../components/auth/AuthCard';
import AuthButton from '../../components/auth/AuthButton';

const steps = [
  { label: 'Basic Info', icon: <Person /> },
  { label: 'Emergency Contact', icon: <ContactEmergency /> },
  { label: 'Medical History', icon: <LocalHospital /> },
  { label: 'Vitals', icon: <FitnessCenter /> },
  { label: 'Lifestyle', icon: <Restaurant /> },
  { label: 'Consent', icon: <VerifiedUser /> },
];

const PatientProfile = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    basicInfo: {
      fullName: '', dateOfBirth: '', gender: '', bloodGroup: '', phoneNumber: '',
      address: { street: '', city: '', state: '', zipCode: '' },
    },
    emergencyContact: { name: '', relationship: '', phoneNumber: '' },
    medicalHistory: {
      allergies: '', chronicConditions: '', currentMedications: '', pastSurgeries: '',
      smokingStatus: '', alcoholConsumption: '',
    },
    vitals: { heightCm: '', weightKg: '', normalBodyTemp: '', normalBPRange: '' },
    lifestyle: { activityLevel: '', dietPreference: '', sleepHoursAvg: '', occupationType: '' },
    consent: { dataSharing: false, notificationPreference: 'In-App', preferredLanguage: 'English', caregiverAccess: false },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await profileService.getProfile();
      if (res.data) {
        const data = res.data;
        const joinArr = (arr) => Array.isArray(arr) ? arr.join(', ') : arr || '';

        setFormData({
          basicInfo: {
            fullName: data.basicInfo?.fullName || '',
            dateOfBirth: data.basicInfo?.dateOfBirth || '',
            gender: data.basicInfo?.gender || '',
            bloodGroup: data.basicInfo?.bloodGroup || '',
            phoneNumber: data.basicInfo?.phoneNumber || '',
            address: {
              street: data.basicInfo?.address?.street || '',
              city: data.basicInfo?.address?.city || '',
              state: data.basicInfo?.address?.state || '',
              zipCode: data.basicInfo?.address?.zipCode || '',
            },
          },
          emergencyContact: {
            name: data.emergencyContact?.name || '',
            relationship: data.emergencyContact?.relationship || '',
            phoneNumber: data.emergencyContact?.phoneNumber || '',
          },
          medicalHistory: {
            allergies: joinArr(data.medicalHistory?.allergies),
            chronicConditions: joinArr(data.medicalHistory?.chronicConditions),
            currentMedications: joinArr(data.medicalHistory?.currentMedications),
            pastSurgeries: joinArr(data.medicalHistory?.pastSurgeries),
            smokingStatus: data.medicalHistory?.smokingStatus || '',
            alcoholConsumption: data.medicalHistory?.alcoholConsumption || '',
          },
          vitals: {
            heightCm: data.vitals?.heightCm || '',
            weightKg: data.vitals?.weightKg || '',
            normalBodyTemp: data.vitals?.normalBodyTemp || '',
            normalBPRange: data.vitals?.normalBPRange || '',
          },
          lifestyle: {
            activityLevel: data.lifestyle?.activityLevel || '',
            dietPreference: data.lifestyle?.dietPreference || '',
            sleepHoursAvg: data.lifestyle?.sleepHoursAvg || '',
            occupationType: data.lifestyle?.occupationType || '',
          },
          consent: {
            dataSharing: data.consent?.dataSharing || false,
            notificationPreference: data.consent?.notificationPreference || 'In-App',
            preferredLanguage: data.consent?.preferredLanguage || 'English',
            caregiverAccess: data.consent?.caregiverAccess || false,
          },
        });
      }
    } catch (err) {
      if (err.response && err.response.status !== 404) {
        setError('Failed to load profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        address: {
          ...prev.basicInfo.address,
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async () => {
    setSuccessMessage('');
    setError('');
    try {
      const splitStr = (str) => str && typeof str === 'string' ? str.split(',').map((s) => s.trim()).filter((s) => s) : [];

      const payload = {
        ...formData,
        medicalHistory: {
          ...formData.medicalHistory,
          allergies: splitStr(formData.medicalHistory.allergies),
          chronicConditions: splitStr(formData.medicalHistory.chronicConditions),
          currentMedications: splitStr(formData.medicalHistory.currentMedications),
          pastSurgeries: splitStr(formData.medicalHistory.pastSurgeries),
        },
      };

      await profileService.updateProfile(payload);
      setSuccessMessage('Profile saved successfully!');
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  const renderStepContent = (step) => {
    const inputSx = {
      '& .MuiOutlinedInput-root': {
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(8px)',
      },
    };

    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.basicInfo.fullName}
                onChange={(e) => handleChange('basicInfo', 'fullName', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.basicInfo.dateOfBirth ? new Date(formData.basicInfo.dateOfBirth).toISOString().split('T')[0] : ''}
                onChange={(e) => handleChange('basicInfo', 'dateOfBirth', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={formData.basicInfo.gender}
                onChange={(e) => handleChange('basicInfo', 'gender', e.target.value)}
                sx={inputSx}
                SelectProps={{ native: false }}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
                <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Blood Group"
                value={formData.basicInfo.bloodGroup}
                onChange={(e) => handleChange('basicInfo', 'bloodGroup', e.target.value)}
                sx={inputSx}
                SelectProps={{ native: false }}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => <MenuItem key={bg} value={bg}>{bg}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.basicInfo.phoneNumber}
                onChange={(e) => handleChange('basicInfo', 'phoneNumber', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12}><Typography variant="subtitle1">Address</Typography></Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Street"
                value={formData.basicInfo.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.basicInfo.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.basicInfo.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Zip Code"
                value={formData.basicInfo.address.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                sx={inputSx}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Name"
                value={formData.emergencyContact.name}
                onChange={(e) => handleChange('emergencyContact', 'name', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Relationship"
                value={formData.emergencyContact.relationship}
                onChange={(e) => handleChange('emergencyContact', 'relationship', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.emergencyContact.phoneNumber}
                onChange={(e) => handleChange('emergencyContact', 'phoneNumber', e.target.value)}
                sx={inputSx}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Known Allergies (comma separated)"
                value={formData.medicalHistory.allergies}
                onChange={(e) => handleChange('medicalHistory', 'allergies', e.target.value)}
                helperText="e.g. Peanuts, Penicillin"
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Chronic Conditions (comma separated)"
                value={formData.medicalHistory.chronicConditions}
                onChange={(e) => handleChange('medicalHistory', 'chronicConditions', e.target.value)}
                helperText="e.g. Diabetes, Asthma"
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Medications (comma separated)"
                value={formData.medicalHistory.currentMedications}
                onChange={(e) => handleChange('medicalHistory', 'currentMedications', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Past Surgeries (comma separated)"
                value={formData.medicalHistory.pastSurgeries}
                onChange={(e) => handleChange('medicalHistory', 'pastSurgeries', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Smoking Status"
                value={formData.medicalHistory.smokingStatus}
                onChange={(e) => handleChange('medicalHistory', 'smokingStatus', e.target.value)}
                sx={inputSx}
              >
                <MenuItem value="Never">Never</MenuItem>
                <MenuItem value="Former">Former</MenuItem>
                <MenuItem value="Current">Current</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Alcohol Consumption"
                value={formData.medicalHistory.alcoholConsumption}
                onChange={(e) => handleChange('medicalHistory', 'alcoholConsumption', e.target.value)}
                sx={inputSx}
              >
                <MenuItem value="None">None</MenuItem>
                <MenuItem value="Occasional">Occasional</MenuItem>
                <MenuItem value="Regular">Regular</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Height (cm)"
                type="number"
                value={formData.vitals.heightCm}
                onChange={(e) => handleChange('vitals', 'heightCm', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                type="number"
                value={formData.vitals.weightKg}
                onChange={(e) => handleChange('vitals', 'weightKg', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Normal Body Temp (°C)"
                type="number"
                value={formData.vitals.normalBodyTemp}
                onChange={(e) => handleChange('vitals', 'normalBodyTemp', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Normal BP Range"
                value={formData.vitals.normalBPRange}
                onChange={(e) => handleChange('vitals', 'normalBPRange', e.target.value)}
                helperText="e.g. 120/80"
                sx={inputSx}
              />
            </Grid>
          </Grid>
        );
      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Activity Level"
                value={formData.lifestyle.activityLevel}
                onChange={(e) => handleChange('lifestyle', 'activityLevel', e.target.value)}
                sx={inputSx}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Moderate">Moderate</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Diet Preference"
                value={formData.lifestyle.dietPreference}
                onChange={(e) => handleChange('lifestyle', 'dietPreference', e.target.value)}
                sx={inputSx}
              >
                <MenuItem value="Vegetarian">Vegetarian</MenuItem>
                <MenuItem value="Non-Vegetarian">Non-Vegetarian</MenuItem>
                <MenuItem value="Vegan">Vegan</MenuItem>
                <MenuItem value="Mixed">Mixed</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Avg Sleep Hours"
                type="number"
                value={formData.lifestyle.sleepHoursAvg}
                onChange={(e) => handleChange('lifestyle', 'sleepHoursAvg', e.target.value)}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Occupation Type"
                value={formData.lifestyle.occupationType}
                onChange={(e) => handleChange('lifestyle', 'occupationType', e.target.value)}
                sx={inputSx}
              >
                <MenuItem value="Sedentary">Sedentary</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Heavy">Heavy</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        );
      case 5:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={formData.consent.dataSharing} onChange={(e) => handleChange('consent', 'dataSharing', e.target.checked)} />}
                label="I consent to share my data for medical analysis."
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={formData.consent.caregiverAccess} onChange={(e) => handleChange('consent', 'caregiverAccess', e.target.checked)} />}
                label="Allow caregiver access to my data."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Notification Preference"
                value={formData.consent.notificationPreference}
                onChange={(e) => handleChange('consent', 'notificationPreference', e.target.value)}
                sx={inputSx}
              >
                <MenuItem value="Email">Email</MenuItem>
                <MenuItem value="SMS">SMS</MenuItem>
                <MenuItem value="In-App">In-App</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Language"
                value={formData.consent.preferredLanguage}
                onChange={(e) => handleChange('consent', 'preferredLanguage', e.target.value)}
                sx={inputSx}
              />
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <AuthCard>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={700}>My Health Profile</Typography>
          <AuthButton
            variant="outlined"
            size="small"
            startIcon={<Download sx={{ fontSize: 18 }} />}
            onClick={async () => {
              try {
                const res = await profileService.exportData();
                const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
                  JSON.stringify(res.data.data, null, 2),
                )}`;
                const link = document.createElement('a');
                link.href = jsonString;
                link.download = `my_health_data_${new Date().toISOString().slice(0, 10)}.json`;
                link.click();
              } catch (_err) {
                setError('Export failed');
              }
            }}
            sx={{ px: 2, py: 1, fontSize: '0.875rem' }}
          >
            Export
          </AuthButton>
        </Box>

        {error && <Fade in={!!error}><Alert severity="error" sx={{ mb: 2 }}>{error}</Alert></Fade>}
        {successMessage && <Fade in={!!successMessage}><Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert></Fade>}

        <ProgressStepper
          steps={steps}
          activeStep={activeStep}
          completedSteps={Array.from({ length: activeStep }, (_, i) => i)}
          sx={{ mb: 4 }}
        />

        <Box>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <AuthButton
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              size="medium"
              sx={{ minWidth: 100 }}
            >
              Back
            </AuthButton>
            {activeStep === steps.length - 1 ? (
              <AuthButton
                onClick={handleSubmit}
                size="medium"
                sx={{ minWidth: 120 }}
              >
                Save Profile
              </AuthButton>
            ) : (
              <AuthButton
                onClick={handleNext}
                size="medium"
                sx={{ minWidth: 100 }}
              >
                Next
              </AuthButton>
            )}
          </Box>
        </Box>
      </AuthCard>
    </Container>
  );
};

export default PatientProfile;
