import { useContext, useState, useEffect } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Link, Navigate } from 'react-router-dom';
import axios from '@/api/axios';
import AuthContext from '@/context/AuthContext';
import DoctorDashboard from './doctor/DoctorDashboard';
import ConsentModal from '@/components/ConsentModal';
import { USER_ROLES, TREATMENT_STATUS } from '@/constants';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);

  const [showConsent, setShowConsent] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState(null);

  // Check for pending consent
  useEffect(() => {
    if (user && user.role === USER_ROLES.PATIENT) {
      checkConsent();
    }
  }, [user]);

  const checkConsent = async () => {
    try {
      const res = await axios.get('/treatments');
      const plans = res.data.data;
      // Find active plan without consent
      const needConsent = plans.find((p) => p.status === TREATMENT_STATUS.ACTIVE && (!p.consent || !p.consent.monitoring));
      if (needConsent) {
        setPendingPlanId(needConsent._id);
        setShowConsent(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!user) return <Navigate to="/login" />;
  if (user.role === USER_ROLES.ADMIN) return <Navigate to="/admin/dashboard" />;

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        {user.role === USER_ROLES.DOCTOR && <DoctorDashboard />}

        {user.role === USER_ROLES.PATIENT && (
          <Box sx={{ mt: 4 }}>
            <Button component={Link} to="/patient/checkin" variant="contained" size="large">Daily Check-In</Button>
            <Typography variant="h6" sx={{ mt: 3 }}>My Recovery Status (Coming Soon)</Typography>

            {pendingPlanId && (
              <ConsentModal
                open={showConsent}
                treatmentPlanId={pendingPlanId}
                onConsentGiven={() => setShowConsent(false)}
              />
            )}
          </Box>
        )}
      </Box>
      {user.role === USER_ROLES.ADMIN && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Admin Panel (Coming Soon)</Typography>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;
