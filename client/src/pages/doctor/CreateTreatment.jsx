import { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, MenuItem, Grid, IconButton, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import treatmentService from '@/services/treatmentService';
import userService from '@/services/userService';
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
    medicationPenalty: 10,
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
      const checklist = formData.symptomChecklist.split(',').map((s) => s.trim());
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
          medicationPenalty: Number(formData.medicationPenalty),
        },
      };

      await treatmentService.createTreatment(payload);
      navigate('/');
    } catch (error) {
      console.error('Error creating plan', error);
      alert('Failed to create plan');
    }
  };

  return (
    <Container maxWidth="md" sx={{
      py: 4,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom sx={{ color: 'white' }}>
          Create Treatment Plan
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(148, 163, 184, 0.8)' }}>
          Configure a comprehensive treatment plan for your patient
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        {/* Patient & Diagnosis Section */}
        <Box sx={{
          mb: 3,
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'white', fontWeight: 600 }}>
            Patient Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select Patient"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                required
                sx={{
                  minWidth: '200px',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(148, 163, 184, 0.8)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                }}
              >
                {patients.map((p) => (
                  <MenuItem key={p._id} value={p._id}>{p.name} ({p.email})</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                required
                placeholder="Enter primary diagnosis"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(148, 163, 184, 0.8)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Treatment Timeline Section */}
        <Box sx={{
          mb: 3,
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'white', fontWeight: 600 }}>
            Treatment Timeline
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                fullWidth
                label="Start Date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(148, 163, 184, 0.8)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                type="number"
                fullWidth
                label="Expected Recovery (Days)"
                name="expectedDays"
                value={formData.expectedDays}
                onChange={handleChange}
                required
                placeholder="e.g., 30"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(148, 163, 184, 0.8)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Risk Configuration Section */}
        <Box sx={{
          mb: 3,
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#60a5fa', fontWeight: 600 }}>
            Risk Engine Configuration
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: 'rgba(148, 163, 184, 0.8)' }}>
            Set thresholds to automatically flag high-risk conditions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{
                p: 3,
                borderRadius: 2,
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
              }}>
                <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Pain Threshold
                </Typography>
                <TextField
                  type="number"
                  fullWidth
                  name="painThreshold"
                  value={formData.painThreshold}
                  onChange={handleChange}
                  sx={{
                    mt: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.6)', mt: 1, display: 'block' }}>
                  Pain level (1-10) triggering alert
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{
                p: 3,
                borderRadius: 2,
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
              }}>
                <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Fever Threshold
                </Typography>
                <TextField
                  type="number"
                  fullWidth
                  name="feverThreshold"
                  value={formData.feverThreshold}
                  onChange={handleChange}
                  sx={{
                    mt: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.6)', mt: 1, display: 'block' }}>
                  Temperature (°F) triggering alert
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{
                p: 3,
                borderRadius: 2,
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
              }}>
                <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Missed Med Penalty
                </Typography>
                <TextField
                  type="number"
                  fullWidth
                  name="medicationPenalty"
                  value={formData.medicationPenalty}
                  onChange={handleChange}
                  sx={{
                    mt: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                      '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.6)', mt: 1, display: 'block' }}>
                  Risk score added for missed meds
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Medications Section */}
        <Box sx={{
          mb: 3,
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'white', fontWeight: 600 }}>
            Medications
          </Typography>
          {formData.medications.map((med, index) => (
            <Box key={index} sx={{
              mb: 2,
              p: 3,
              borderRadius: 2,
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Medication Name"
                    value={med.name}
                    onChange={(e) => handleMedChange(index, 'name', e.target.value)}
                    required
                    placeholder="e.g., Ibuprofen"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(148, 163, 184, 0.8)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Dosage"
                    value={med.dosage}
                    onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                    required
                    placeholder="e.g., 200mg"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(148, 163, 184, 0.8)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Frequency"
                    value={med.frequency}
                    onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                    required
                    placeholder="e.g., Twice daily"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        color: 'white',
                        '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(148, 163, 184, 0.8)' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton
                    onClick={() => removeMedication(index)}
                    sx={{
                      color: '#ef4444',
                      '&:hover': {
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={addMedication}
            sx={{
              mt: 2,
              color: '#60a5fa',
              borderColor: 'rgba(59, 130, 246, 0.3)',
              '&:hover': {
                borderColor: 'rgba(59, 130, 246, 0.5)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
              },
            }}
            variant="outlined"
          >
            Add Medication
          </Button>
        </Box>

        {/* Symptoms Tracking Section */}
        <Box sx={{
          mb: 4,
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}>
          <Typography variant="h6" sx={{ mb: 3, color: 'white', fontWeight: 600 }}>
            Symptoms to Track
          </Typography>
          <TextField
            fullWidth
            label="Symptom Checklist"
            name="symptomChecklist"
            value={formData.symptomChecklist}
            onChange={handleChange}
            placeholder="e.g., Headache, Nausea, Swelling, Dizziness"
            helperText="Enter symptoms separated by commas"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                color: 'white',
                '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(148, 163, 184, 0.8)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
              '& .MuiFormHelperText-root': { color: 'rgba(148, 163, 184, 0.6)' },
            }}
          />
        </Box>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              px: 8,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                borderColor: 'rgba(59, 130, 246, 0.5)',
              },
            }}
          >
            Create Treatment Plan
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default CreateTreatment;
