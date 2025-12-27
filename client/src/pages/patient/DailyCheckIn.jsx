import {useState, useEffect} from 'react';
import {
  Container, Typography, TextField, Button, Box, FormControlLabel,
  Checkbox, Grid, Alert, Fade, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip,
} from '@mui/material';
import {
  Thermostat,
  Medication,
  Sick,
  EventAvailable,
  EmojiEvents,
  Close as CloseIcon,
} from '@mui/icons-material';
import checkInService from '@/services/checkInService';
import AuthCard from '@/components/auth/AuthCard';
import AuthButton from '@/components/auth/AuthButton';
import AuthInput from '@/components/auth/AuthInput';
import PainLevelSlider from '@/components/patient/PainLevelSlider';
import PatientCard from '@/components/patient/PatientCard';

const DailyCheckIn = () => {
  const [formData, setFormData] = useState({
    painLevel: 5,
    temperature: 98.6,
    medicationsTaken: false,
    symptoms: '',
    notes: '',
  });
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [milestoneModal, setMilestoneModal] = useState({open: false, milestone: null});

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
    setFormData({...formData, [e.target.name]: value});
  };

  const handlePainChange = (e, newValue) => {
    setFormData({...formData, painLevel: newValue});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const symptomsList = formData.symptoms.split(',').map((s) => s.trim()).filter((s) => s);
      const res = await checkInService.submitCheckIn({...formData, symptoms: symptomsList});

      setMessage('Check-in submitted successfully!');

      // Milestone Notification
      if (res.data.milestones && res.data.milestones.length > 0) {
        const ms = res.data.milestones[0];
        setMilestoneModal({open: true, milestone: ms});
      }

      // Reset form
      setFormData({
        painLevel: 5,
        temperature: 98.6,
        medicationsTaken: false,
        symptoms: '',
        notes: '',
      });

      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const getMilestoneText = (milestone) => {
    if (!milestone) return '';
    if (milestone.type === 'PAIN_IMPROVEMENT') {
      return `Pain Reduced by ${milestone.metaData.improvement}%!`;
    }
    if (milestone.type === 'MEDICATION_STREAK') {
      return `${milestone.metaData.days} Day Medication Streak!`;
    }
    return 'Milestone Unlocked!';
  };

  const getRiskColor = (score) => {
    if (score > 30) return 'alert';
    if (score > 15) return 'warning';
    return 'good';
  };

  return (
    <Container maxWidth="lg" sx={{py: 4}}>
      {/* Header */}
      <Box sx={{textAlign: 'center', mb: 4}}>
        <EventAvailable sx={{fontSize: 56, color: 'primary.main', mb: 2}} />
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Daily Recovery Check-In
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your recovery progress and help your care team monitor your health
        </Typography>
      </Box>

      {/* Messages */}
      <Fade in={!!message || !!error}>
        <Box sx={{mb: 3}}>
          {message && (
            <Alert
              severity="success"
              sx={{
                borderRadius: 2,
                backgroundColor: 'rgba(102, 187, 106, 0.1)',
                border: '1px solid rgba(102, 187, 106, 0.3)',
              }}
            >
              {message}
            </Alert>
          )}
          {error && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 2,
                backgroundColor: 'rgba(239, 83, 80, 0.1)',
                border: '1px solid rgba(239, 83, 80, 0.3)',
              }}
            >
              {error}
            </Alert>
          )}
        </Box>
      </Fade>

      {/* Check-In Form */}
      <AuthCard sx={{mb: 4}}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Pain Level */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <Sick /> Pain Level Assessment
              </Typography>
              <PainLevelSlider
                value={formData.painLevel}
                onChange={handlePainChange}
              />
            </Grid>

            {/* Temperature */}
            <Grid item xs={12} md={6}>
              <AuthInput
                fullWidth
                label="Temperature"
                name="temperature"
                type="number"
                value={formData.temperature}
                onChange={handleChange}
                required
                inputProps={{step: 0.1, min: 95, max: 105}}
                icon={<Thermostat sx={{color: 'text.secondary', fontSize: 20}} />}
              />
            </Grid>

            {/* Medications Checkbox */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.medicationsTaken}
                      onChange={handleChange}
                      name="medicationsTaken"
                      sx={{
                        'color': 'primary.main',
                        '&.Mui-checked': {
                          color: 'success.main',
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                      <Medication sx={{fontSize: 20}} />
                      <Typography>I have taken my prescribed medications</Typography>
                    </Box>
                  }
                />
              </Box>
            </Grid>

            {/* Symptoms */}
            <Grid item xs={12}>
              <AuthInput
                fullWidth
                label="Symptoms (comma separated)"
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                helperText="e.g. Headache, Nausea, Swelling"
                icon={<Sick sx={{color: 'text.secondary', fontSize: 20}} />}
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                name="notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    backdropFilter: 'blur(8px)',
                  },
                }}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <AuthButton
                type="submit"
                loading={loading}
                sx={{width: {xs: '100%', sm: 'auto'}, px: 6}}
              >
                Submit Check-In
              </AuthButton>
            </Grid>
          </Grid>
        </form>
      </AuthCard>

      {/* Check-In History */}
      {history.length > 0 && (
        <>
          <Typography variant="h5" align="center" sx={{mb: 3, fontWeight: 600}}>
            Previous Check-Ins
          </Typography>
          <Grid container spacing={3}>
            {history.map((checkin) => (
              <Grid item xs={12} sm={6} md={4} key={checkin._id}>
                <PatientCard
                  title={new Date(checkin.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                  value={`${checkin.riskScore} Risk`}
                  status={getRiskColor(checkin.riskScore)}
                  subtitle={
                    <Box sx={{mt: 1}}>
                      <Typography variant="body2" sx={{mb: 0.5}}>
                        Pain: {checkin.painLevel}/10 | Temp:{' '}
                        {checkin.temperature}°F
                      </Typography>
                      <Typography variant="body2" sx={{mb: 0.5}}>
                        Meds: {checkin.medicationsTaken ? '✓ Taken' : '✗ Not Taken'}
                      </Typography>
                      {checkin.riskReasons && checkin.riskReasons.length > 0 && (
                        <Box sx={{mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                          {checkin.riskReasons.map((reason, idx) => (
                            <Chip
                              key={idx}
                              label={reason}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(239, 83, 80, 0.2)',
                                color: '#ef5350',
                                fontSize: '0.7rem',
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  }
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Milestone Modal */}
      <Dialog
        open={milestoneModal.open}
        onClose={() => setMilestoneModal({open: false, milestone: null})}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: 3,
            minWidth: {xs: '90%', sm: 400},
          },
        }}
      >
        <DialogTitle sx={{textAlign: 'center', pt: 4}}>
          <EmojiEvents sx={{fontSize: 72, color: '#ffd700', mb: 2}} />
          <Typography variant="h4" fontWeight={700}>
            Milestone Unlocked!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{textAlign: 'center', pb: 2}}>
          <Typography variant="h5" color="primary" fontWeight={600}>
            🎉 {getMilestoneText(milestoneModal.milestone)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{mt: 2}}>
            Keep up the great work on your recovery journey!
          </Typography>
        </DialogContent>
        <DialogActions sx={{justifyContent: 'center', pb: 3}}>
          <AuthButton onClick={() => setMilestoneModal({open: false, milestone: null})}>
            Continue
          </AuthButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DailyCheckIn;

