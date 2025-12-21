import { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Slider, FormControlLabel, Checkbox, Card, CardContent, Grid, Paper } from '@mui/material';
import checkInService from '../../services/checkInService';

const DailyCheckIn = () => {
    const [formData, setFormData] = useState({
        painLevel: 5,
        temperature: 98.6,
        medicationsTaken: false,
        symptoms: '',
        notes: ''
    });
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await checkInService.getHistory();
            setHistory(res.data.data);
        } catch (error) {
            console.error('Error fetching history', error);
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSliderChange = (e, newValue) => {
        setFormData({ ...formData, painLevel: newValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const symptomsList = formData.symptoms.split(',').map(s => s.trim()).filter(s => s);
            const res = await checkInService.submitCheckIn({ ...formData, symptoms: symptomsList });

            setMessage('Check-in submitted successfully!');

            // Milestone Notification
            if (res.data.milestones && res.data.milestones.length > 0) {
                const ms = res.data.milestones[0]; // Just show first for now
                let text = 'Milestone Unlocked!';
                if (ms.type === 'PAIN_IMPROVEMENT') text = `🎉 Pain Reduced by ${ms.metaData.improvement}%!`;
                if (ms.type === 'MEDICATION_STREAK') text = `🔥 ${ms.metaData.days} Day Medication Streak!`;
                alert(text); // Simple alert for MVP, can be upgraded to Modal
            }

            fetchHistory();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Submission failed');
        }
    };

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>Daily Recovery Check-In</Typography>
                {message && <Typography color="primary" align="center" sx={{ mb: 2 }}>{message}</Typography>}

                <form onSubmit={handleSubmit}>
                    <Typography gutterBottom>Pain Level (1-10)</Typography>
                    <Slider
                        value={formData.painLevel}
                        onChange={handleSliderChange}
                        min={1}
                        max={10}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Temperature (°F)"
                        name="temperature"
                        type="number"
                        value={formData.temperature}
                        onChange={handleChange}
                        margin="normal"
                        required
                    />

                    <FormControlLabel
                        control={<Checkbox checked={formData.medicationsTaken} onChange={handleChange} name="medicationsTaken" />}
                        label="I have taken my prescribed medications"
                        sx={{ mt: 1, display: 'block', textAlign: 'center' }}
                    />

                    <TextField
                        fullWidth
                        label="Symptoms (comma separated)"
                        name="symptoms"
                        value={formData.symptoms}
                        onChange={handleChange}
                        margin="normal"
                        helperText="e.g. Headache, Nausea, Swelling"
                    />

                    <TextField
                        fullWidth
                        label="Additional Notes"
                        name="notes"
                        multiline
                        rows={3}
                        value={formData.notes}
                        onChange={handleChange}
                        margin="normal"
                    />

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Button type="submit" variant="contained" size="large" sx={{ px: 5 }}>Submit Check-In</Button>
                    </Box>
                </form>
            </Paper>

            <Typography variant="h5" align="center" sx={{ mt: 5, mb: 3 }}>Previous Check-Ins</Typography>
            <Grid container spacing={2} justifyContent="center">
                {history.map((checkin) => (
                    <Grid item xs={12} sm={6} md={4} key={checkin._id}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom align="center">
                                    {new Date(checkin.date).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2">Pain: {checkin.painLevel}/10</Typography>
                                <Typography variant="body2">Temp: {checkin.temperature}°F</Typography>
                                <Typography variant="body2">Meds: {checkin.medicationsTaken ? 'Yes' : 'No'}</Typography>
                                <Box sx={{ mt: 1, textAlign: 'center' }}>
                                    <Typography variant="body2" color={checkin.riskScore > 30 ? 'error' : 'primary'} fontWeight="bold">
                                        Risk Score: {checkin.riskScore} ({checkin.riskLevel})
                                    </Typography>
                                    {checkin.riskReasons && checkin.riskReasons.length > 0 && (
                                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {checkin.riskReasons.join(', ')}
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default DailyCheckIn;
