import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container, Typography, Paper, Grid, Box, Chip, Divider, List, ListItem,
    ListItemText, ListItemIcon, Button, CircularProgress, Alert
} from '@mui/material';
import {
    LocalPharmacy as MedIcon,
    Event as DateIcon,
    MedicalServices as DiagnosisIcon,
    CheckCircle as CheckIcon,
    ArrowBack as BackIcon
} from '@mui/icons-material';
import treatmentService from '../../services/treatmentService';

const TreatmentPlanDetail = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [activePlan, setActivePlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                // Fetch all plans for this patient (filtered by doctor on backend)
                const res = await treatmentService.getTreatments({ patientId });

                // Find the ACTIVE plan
                const plans = res.data.data;
                const currentPlan = plans.find(p => p.status === 'ACTIVE');

                if (currentPlan) {
                    setActivePlan(currentPlan);
                } else {
                    setError('No active treatment plan found for this patient.');
                }
            } catch (err) {
                console.error("Failed to fetch treatment plan", err);
                setError('Failed to load treatment details.');
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchPlan();
        }
    }, [patientId]);

    const handleBack = () => {
        navigate(-1); // Go back to previous page (likely Chat)
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
                    Back
                </Button>
                <Alert severity="warning">{error}</Alert>
            </Container>
        );
    }

    if (!activePlan) return null;

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
                Back to Chat
            </Button>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Treatment Plan
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Patient: {activePlan.patientId?.name || 'Unknown'}
                        </Typography>
                    </Box>
                    <Chip
                        label={activePlan.status}
                        color={activePlan.status === 'ACTIVE' ? 'success' : 'default'}
                        sx={{ fontSize: '1rem', px: 1, py: 0.5 }}
                    />
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={4}>
                    {/* Key Details */}
                    <Grid item xs={12} md={6}>
                        <Box mb={3}>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DiagnosisIcon /> Diagnosis
                            </Typography>
                            <Typography variant="body1" fontSize="1.1rem">
                                {activePlan.diagnosis}
                            </Typography>
                        </Box>

                        <Box mb={3}>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DateIcon /> Start Date
                            </Typography>
                            <Typography variant="body1">
                                {new Date(activePlan.startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckIcon /> Expected Duration
                            </Typography>
                            <Typography variant="body1">
                                {activePlan.expectedDays} Days
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Medications */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MedIcon /> Prescribed Medications
                        </Typography>
                        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                            <List disablePadding>
                                {activePlan.medications.map((med, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={<Typography fontWeight="500">{med.name}</Typography>}
                                                secondary={`Frequency: ${med.frequency} | Duration: ${med.duration}`}
                                            />
                                        </ListItem>
                                        {index < activePlan.medications.length - 1 && <Divider component="li" />}
                                    </React.Fragment>
                                ))}
                                {activePlan.medications.length === 0 && (
                                    <ListItem>
                                        <ListItemText secondary="No medications prescribed." />
                                    </ListItem>
                                )}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Symptom Checklist */}
                    <Grid item xs={12}>
                        <Box mt={2}>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                                Monitored Symptoms
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {activePlan.symptomChecklist && activePlan.symptomChecklist.map((symptom, idx) => (
                                    <Chip key={idx} label={symptom} variant="outlined" />
                                ))}
                                {(!activePlan.symptomChecklist || activePlan.symptomChecklist.length === 0) && (
                                    <Typography variant="body2" color="text.secondary">No specific symptoms monitored.</Typography>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default TreatmentPlanDetail;
