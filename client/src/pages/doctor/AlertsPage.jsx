import {useState, useEffect} from 'react';
import {Container, Typography, List, ListItem, ListItemText, IconButton, Paper, Chip, Box, Button, Grid} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import alertService from '@/services/alertService';
import {Link} from 'react-router-dom';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await alertService.getAlerts();
      setAlerts(res.data.data);
    } catch (error) {
      console.error('Error fetching alerts', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await alertService.markAsRead(id);
      // Optimistically update
      setAlerts(alerts.map((a) => a._id === id ? {...a, isRead: true} : a));
    } catch (error) {
      console.error('Error marking as read', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{mt: 4}}>
      <Typography variant="h4" gutterBottom align="center">Notifications & Alerts</Typography>
      <Paper elevation={3} sx={{mt: 2, borderRadius: 2}}>
        <List>
          {alerts.length === 0 && (
            <ListItem>
              <ListItemText primary="No notifications" />
            </ListItem>
          )}
          {alerts.map((alert) => (
            <ListItem
              key={alert._id}
              sx={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                bgcolor: alert.isRead ? 'transparent' : 'rgba(211, 47, 47, 0.08)',
                display: 'flex',
                alignItems: 'center',
                py: 2,
              }}
            >
              <Box sx={{mr: 2, display: 'flex', alignItems: 'center'}}>
                {alert.type === 'RISK_HIGH' && <WarningIcon color="error" fontSize="large" />}
              </Box>

              <Box sx={{flexGrow: 1, mr: 2}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>
                  <Typography variant="h6" component="span" fontWeight={alert.isRead ? 'normal' : 'bold'}>
                                        Risk Alert: {alert.patientId?.name || 'Unknown Patient'}
                  </Typography>
                  {!alert.isRead && <Chip label="New" color="error" size="small" />}
                </Box>
                <Typography variant="body1" color="text.primary" sx={{mb: 0.5}}>
                  {alert.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(alert.createdAt).toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <Button component={Link} to={`/doctor/patient/${alert.patientId?._id}`} variant="outlined" size="small">
                                    View
                </Button>
                {!alert.isRead && (
                  <IconButton
                    aria-label="mark as read"
                    onClick={() => handleMarkAsRead(alert._id)}
                    title="Mark as Read"
                    color="primary"
                  >
                    <CheckCircleIcon />
                  </IconButton>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default AlertsPage;
