import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Stepper, Step, StepLabel, Button, Grid, TextField,
    MenuItem, FormControl, InputLabel, Select, Paper, FormControlLabel, Switch,
    FormGroup, Checkbox, CircularProgress, Alert
} from '@mui/material';
import profileService from '../../services/profileService';

const steps = ['Basic Info', 'Emergency Contact', 'Medical History', 'Vitals', 'Lifestyle', 'Consent'];

const PatientProfile = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        basicInfo: {
            fullName: '', dateOfBirth: '', gender: '', bloodGroup: '', phoneNumber: '',
            address: { street: '', city: '', state: '', zipCode: '' }
        },
        emergencyContact: { name: '', relationship: '', phoneNumber: '' },
        medicalHistory: {
            allergies: '', chronicConditions: '', currentMedications: '', pastSurgeries: '',
            smokingStatus: '', alcoholConsumption: ''
        },
        vitals: { heightCm: '', weightKg: '', normalBodyTemp: '', normalBPRange: '' },
        lifestyle: { activityLevel: '', dietPreference: '', sleepHoursAvg: '', occupationType: '' },
        consent: { dataSharing: false, notificationPreference: 'In-App', preferredLanguage: 'English', caregiverAccess: false }
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await profileService.getProfile();
            if (res.data) {
                // Initialize form with fetched data
                // Need to handle array to comma-separated string conversions for medical history if any
                const data = res.data;

                // Helper to join arrays
                const joinArr = (arr) => Array.isArray(arr) ? arr.join(', ') : arr;

                setFormData({
                    ...data,
                    medicalHistory: {
                        ...data.medicalHistory,
                        allergies: joinArr(data.medicalHistory?.allergies),
                        chronicConditions: joinArr(data.medicalHistory?.chronicConditions),
                        currentMedications: joinArr(data.medicalHistory?.currentMedications),
                        pastSurgeries: joinArr(data.medicalHistory?.pastSurgeries),
                    }
                });
            }
        } catch (err) {
            // Profile might not exist yet, which is fine
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
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleAddressChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            basicInfo: {
                ...prev.basicInfo,
                address: {
                    ...prev.basicInfo.address,
                    [field]: value
                }
            }
        }));
    };

    const handleMedicalArrayChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            medicalHistory: {
                ...prev.medicalHistory,
                [field]: value // Store as string in state, split on submit
            }
        }));
    };

    const handleSubmit = async () => {
        setSuccessMessage('');
        setError('');
        try {
            // Prepare data: split strings into arrays for medical history
            const splitStr = (str) => str && typeof str === 'string' ? str.split(',').map(s => s.trim()).filter(s => s) : [];

            const payload = {
                ...formData,
                medicalHistory: {
                    ...formData.medicalHistory,
                    allergies: splitStr(formData.medicalHistory.allergies),
                    chronicConditions: splitStr(formData.medicalHistory.chronicConditions),
                    currentMedications: splitStr(formData.medicalHistory.currentMedications),
                    pastSurgeries: splitStr(formData.medicalHistory.pastSurgeries),
                }
            };

            await profileService.updateProfile(payload);
            setSuccessMessage('Profile saved successfully!');
            // Optional: scroll to top
            window.scrollTo(0, 0);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save profile.');
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Full Name" value={formData.basicInfo.fullName} onChange={(e) => handleChange('basicInfo', 'fullName', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={formData.basicInfo.dateOfBirth ? new Date(formData.basicInfo.dateOfBirth).toISOString().split('T')[0] : ''} onChange={(e) => handleChange('basicInfo', 'dateOfBirth', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Gender</InputLabel>
                                <Select value={formData.basicInfo.gender} label="Gender" onChange={(e) => handleChange('basicInfo', 'gender', e.target.value)}>
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                    <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Blood Group</InputLabel>
                                <Select value={formData.basicInfo.bloodGroup} label="Blood Group" onChange={(e) => handleChange('basicInfo', 'bloodGroup', e.target.value)}>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <MenuItem key={bg} value={bg}>{bg}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Phone Number" value={formData.basicInfo.phoneNumber} onChange={(e) => handleChange('basicInfo', 'phoneNumber', e.target.value)} />
                        </Grid>
                        <Grid item xs={12}><Typography variant="subtitle1">Address</Typography></Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Street" value={formData.basicInfo.address.street} onChange={(e) => handleAddressChange('street', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="City" value={formData.basicInfo.address.city} onChange={(e) => handleAddressChange('city', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="State" value={formData.basicInfo.address.state} onChange={(e) => handleAddressChange('state', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Zip Code" value={formData.basicInfo.address.zipCode} onChange={(e) => handleAddressChange('zipCode', e.target.value)} />
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Contact Name" value={formData.emergencyContact.name} onChange={(e) => handleChange('emergencyContact', 'name', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Relationship" value={formData.emergencyContact.relationship} onChange={(e) => handleChange('emergencyContact', 'relationship', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Phone Number" value={formData.emergencyContact.phoneNumber} onChange={(e) => handleChange('emergencyContact', 'phoneNumber', e.target.value)} />
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Known Allergies (comma separated)" value={formData.medicalHistory.allergies} onChange={(e) => handleMedicalArrayChange('allergies', e.target.value)} helperText="e.g. Peanuts, Penicillin" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Chronic Conditions (comma separated)" value={formData.medicalHistory.chronicConditions} onChange={(e) => handleMedicalArrayChange('chronicConditions', e.target.value)} helperText="e.g. Diabetes, Asthma" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Current Medications (comma separated)" value={formData.medicalHistory.currentMedications} onChange={(e) => handleMedicalArrayChange('currentMedications', e.target.value)} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Past Surgeries (comma separated)" value={formData.medicalHistory.pastSurgeries} onChange={(e) => handleMedicalArrayChange('pastSurgeries', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Smoking Status</InputLabel>
                                <Select value={formData.medicalHistory.smokingStatus} label="Smoking Status" onChange={(e) => handleChange('medicalHistory', 'smokingStatus', e.target.value)}>
                                    <MenuItem value="Never">Never</MenuItem>
                                    <MenuItem value="Former">Former</MenuItem>
                                    <MenuItem value="Current">Current</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Alcohol Consumption</InputLabel>
                                <Select value={formData.medicalHistory.alcoholConsumption} label="Alcohol Consumption" onChange={(e) => handleChange('medicalHistory', 'alcoholConsumption', e.target.value)}>
                                    <MenuItem value="None">None</MenuItem>
                                    <MenuItem value="Occasional">Occasional</MenuItem>
                                    <MenuItem value="Regular">Regular</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                );
            case 3:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Height (cm)" type="number" value={formData.vitals.heightCm} onChange={(e) => handleChange('vitals', 'heightCm', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Weight (kg)" type="number" value={formData.vitals.weightKg} onChange={(e) => handleChange('vitals', 'weightKg', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Normal Body Temp (°C)" type="number" value={formData.vitals.normalBodyTemp} onChange={(e) => handleChange('vitals', 'normalBodyTemp', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Normal BP Range" value={formData.vitals.normalBPRange} onChange={(e) => handleChange('vitals', 'normalBPRange', e.target.value)} helperText="e.g. 120/80" />
                        </Grid>
                    </Grid>
                );
            case 4:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Activity Level</InputLabel>
                                <Select value={formData.lifestyle.activityLevel} label="Activity Level" onChange={(e) => handleChange('lifestyle', 'activityLevel', e.target.value)}>
                                    <MenuItem value="Low">Low</MenuItem>
                                    <MenuItem value="Moderate">Moderate</MenuItem>
                                    <MenuItem value="High">High</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Diet Preference</InputLabel>
                                <Select value={formData.lifestyle.dietPreference} label="Diet Preference" onChange={(e) => handleChange('lifestyle', 'dietPreference', e.target.value)}>
                                    <MenuItem value="Vegetarian">Vegetarian</MenuItem>
                                    <MenuItem value="Non-Vegetarian">Non-Vegetarian</MenuItem>
                                    <MenuItem value="Vegan">Vegan</MenuItem>
                                    <MenuItem value="Mixed">Mixed</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Avg Sleep Hours" type="number" value={formData.lifestyle.sleepHoursAvg} onChange={(e) => handleChange('lifestyle', 'sleepHoursAvg', e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Occupation Type</InputLabel>
                                <Select value={formData.lifestyle.occupationType} label="Occupation Type" onChange={(e) => handleChange('lifestyle', 'occupationType', e.target.value)}>
                                    <MenuItem value="Sedentary">Sedentary</MenuItem>
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Heavy">Heavy</MenuItem>
                                </Select>
                            </FormControl>
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
                            <FormControl fullWidth>
                                <InputLabel>Notification Preference</InputLabel>
                                <Select value={formData.consent.notificationPreference} label="Notification Preference" onChange={(e) => handleChange('consent', 'notificationPreference', e.target.value)}>
                                    <MenuItem value="Email">Email</MenuItem>
                                    <MenuItem value="SMS">SMS</MenuItem>
                                    <MenuItem value="In-App">In-App</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Preferred Language" value={formData.consent.preferredLanguage} onChange={(e) => handleChange('consent', 'preferredLanguage', e.target.value)} />
                        </Grid>
                    </Grid>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h4" align="center">My Health Profile</Typography>
                    <Button variant="outlined" color="primary" onClick={async () => {
                        try {
                            const res = await profileService.exportData();
                            const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
                                JSON.stringify(res.data.data, null, 2)
                            )}`;
                            const link = document.createElement("a");
                            link.href = jsonString;
                            link.download = `my_health_data_${new Date().toISOString().slice(0, 10)}.json`;
                            link.click();
                        } catch (err) {
                            setError('Export failed');
                        }
                    }}>
                        Export Data (JSON)
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box>
                    {renderStepContent(activeStep)}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                            Back
                        </Button>
                        {activeStep === steps.length - 1 ? (
                            <Button variant="contained" color="primary" onClick={handleSubmit}>
                                Save Profile
                            </Button>
                        ) : (
                            <Button variant="contained" onClick={handleNext}>
                                Next
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default PatientProfile;
