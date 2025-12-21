import { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, MenuItem, Grid, IconButton, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import treatmentService from '../../services/treatmentService';
import userService from '../../services/userService';
import { useNavigate } from 'react-router-dom';

const CreateTreatment = () => {
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState({
        patientId: '',
        diagnosis: '',
        startDate: '',
        expectedDays: '',
        medications: [{ name: '', dosage: '', frequency: '' }],
        symptomChecklist: '', // simple comma separated for now
        // Risk Config (Flattened state for easier binding, structure before submit)
        feverThreshold: 100.4,
        painThreshold: 7,
        medicationPenalty: 10
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await userService.getPatients();
                setPatients(res.data.data);
            } catch (error) {
                console.error('Error fetching patients', error);
            }
        };
        fetchPatients();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMedChange = (index, field, value) => {
        const newMeds = [...formData.medications];
        newMeds[index][field] = value;
        setFormData({ ...formData, medications: newMeds });
    };

    const addMedication = () => {
        setFormData({ ...formData, medications: [...formData.medications, { name: '', dosage: '', frequency: '' }] });
    };

    const removeMedication = (index) => {
        const newMeds = formData.medications.filter((_, i) => i !== index);
        setFormData({ ...formData, medications: newMeds });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const checklist = formData.symptomChecklist.split(',').map(s => s.trim());
            // Structure payload to match Schema
            const payload = {
                patientId: formData.patientId,
                diagnosis: formData.diagnosis,
                startDate: formData.startDate,
                expectedDays: formData.expectedDays,
                medications: formData.medications,
                symptomChecklist: checklist,
                riskConfig: {
                    feverThreshold: Number(formData.feverThreshold),
                    painThreshold: Number(formData.painThreshold),
                    medicationPenalty: Number(formData.medicationPenalty)
                }
            };

            await treatmentService.createTreatment(payload);
            navigate('/');
        } catch (error) {
            console.error('Error creating plan', error);
            alert('Failed to create plan');
        }
    };

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>Create Treatment Plan</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField select fullWidth label="Select Patient" name="patientId" value={formData.patientId} onChange={handleChange} margin="normal" required>
                        {patients.map(p => (
                            <MenuItem key={p._id} value={p._id}>{p.name} ({p.email})</MenuItem>
                        ))}
                    </TextField>
                    <TextField fullWidth label="Diagnosis" name="diagnosis" value={formData.diagnosis} onChange={handleChange} margin="normal" required />
                    <TextField type="date" fullWidth label="Start Date" name="startDate" value={formData.startDate} onChange={handleChange} margin="normal" InputLabelProps={{ shrink: true }} required />
                    <TextField type="number" fullWidth label="Expected Recovery (Days)" name="expectedDays" value={formData.expectedDays} onChange={handleChange} margin="normal" required />

                    {/* Risk Configuration Section */}
                    <Box sx={{ mt: 3, mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="h6" gutterBottom color="primary">Risk Engine Rules</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    type="number"
                                    fullWidth
                                    label="Pain Threshold"
                                    name="painThreshold"
                                    value={formData.painThreshold}
                                    onChange={handleChange}
                                    helperText="Pain level (1-10) that triggers High Risk. Default: 7"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    type="number"
                                    fullWidth
                                    label="Fever Threshold (°F)"
                                    name="feverThreshold"
                                    value={formData.feverThreshold}
                                    onChange={handleChange}
                                    helperText="Temp that triggers High Risk. Default: 100.4"
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    type="number"
                                    fullWidth
                                    label="Missed Med Penalty"
                                    name="medicationPenalty"
                                    value={formData.medicationPenalty}
                                    onChange={handleChange}
                                    helperText="Risk score added for missed meds. Default: 10"
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Medications</Typography>
                    {formData.medications.map((med, index) => (
                        <Grid container spacing={2} key={index} sx={{ mb: 1, alignItems: 'center' }}>
                            <Grid item xs={4}>
                                <TextField fullWidth label="Name" value={med.name} onChange={(e) => handleMedChange(index, 'name', e.target.value)} required />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField fullWidth label="Dosage" value={med.dosage} onChange={(e) => handleMedChange(index, 'dosage', e.target.value)} required />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField fullWidth label="Frequency" value={med.frequency} onChange={(e) => handleMedChange(index, 'frequency', e.target.value)} required />
                            </Grid>
                            <Grid item xs={1}>
                                <IconButton color="error" onClick={() => removeMedication(index)}><DeleteIcon /></IconButton>
                            </Grid>
                        </Grid>
                    ))}
                    <Button startIcon={<AddIcon />} onClick={addMedication} sx={{ mb: 2 }}>Add Medication</Button>

                    <TextField fullWidth label="Symptoms to Track (comma separated)" name="symptomChecklist" value={formData.symptomChecklist} onChange={handleChange} margin="normal" />

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Button type="submit" variant="contained" size="large" sx={{ px: 5 }}>Create Plan</Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default CreateTreatment;
