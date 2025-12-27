import {useState, useEffect} from 'react';
import {Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Box, Tooltip} from '@mui/material';
import {Link} from 'react-router-dom';
import dashboardService from '../../services/dashboardService';

const DoctorDashboard = () => {
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const res = await dashboardService.getPatientStatuses();
      setStatuses(res.data.data);
    } catch (error) {
      console.error('Error fetching dashboard', error);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 61) return 'error';
    if (score >= 31) return 'warning';
    return 'success';
  };

  const getRiskLabel = (score) => {
    if (score >= 61) return 'CRITICAL';
    if (score >= 31) return 'Monitor';
    return 'Normal';
  };

  return (
    <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
      <Typography variant="h4" gutterBottom align="center" sx={{mb: 4}}>Patient Recovery Status</Typography>

      <Box sx={{display: 'flex', justifyContent: 'center', mb: 4}}>
        <Button component={Link} to="/doctor/create-treatment" variant="contained" size="large">Create New Treatment Plan</Button>
      </Box>

      <TableContainer component={Paper} elevation={3} sx={{borderRadius: 2}}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Patient Name</TableCell>
              <TableCell align="center">Email</TableCell>
              <TableCell align="center">Last Check-In</TableCell>
              <TableCell align="center">Pain Level</TableCell>
              <TableCell align="center">Temp (°F)</TableCell>
              <TableCell align="center">Meds Taken</TableCell>
              <TableCell align="center">Risk Score</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {statuses.map((status) => (
              <TableRow key={status._id} hover>
                <TableCell align="center">
                  <Button component={Link} to={`/doctor/patient/${status._id}`}>{status.patientInfo.name}</Button>
                </TableCell>
                <TableCell align="center">{status.patientInfo.email}</TableCell>
                <TableCell align="center">{new Date(status.latestCheckIn.date).toLocaleDateString()}</TableCell>
                <TableCell align="center">{status.latestCheckIn.painLevel}/10</TableCell>
                <TableCell align="center">{status.latestCheckIn.temperature}</TableCell>
                <TableCell align="center">{status.latestCheckIn.medicationsTaken ? 'Yes' : 'No'}</TableCell>
                <TableCell align="center">{status.latestCheckIn.riskScore}</TableCell>
                <TableCell align="center">
                  <Tooltip title={status.latestCheckIn.riskReasons ? status.latestCheckIn.riskReasons.join(', ') : ''} arrow>
                    <Chip
                      label={status.latestCheckIn.riskLevel || getRiskLabel(status.latestCheckIn.riskScore)}
                      color={getRiskColor(status.latestCheckIn.riskScore)}
                      variant="filled"
                    />
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default DoctorDashboard;
