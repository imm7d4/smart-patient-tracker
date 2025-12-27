import React, {useState} from 'react';
import {Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, FormControlLabel, Checkbox, Typography} from '@mui/material';
import axios from '../api/axios';

const ConsentModal = ({open, treatmentPlanId, onConsentGiven}) => {
  const [monitoring, setMonitoring] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!monitoring || !messaging) {
      setError('You must accept both to proceed with the treatment plan.');
      return;
    }

    try {
      await axios.patch(`/treatments/${treatmentPlanId}/consent`, {
        monitoring,
        messaging,
      });
      onConsentGiven();
    } catch (err) {
      console.error('Consent Error:', err);
      setError('Failed to save consent. Please try again.');
    }
  };

  return (
    <Dialog open={open} disableEscapeKeyDown>
      <DialogTitle>Patient Consent & Disclosure</DialogTitle>
      <DialogContent>
        <DialogContentText paragraph>
                    To participate in this Smart Treatment Plan, we require your explicit consent for the following:
        </DialogContentText>

        <FormControlLabel
          control={<Checkbox checked={monitoring} onChange={(e) => setMonitoring(e.target.checked)} />}
          label={
            <Typography variant="body2">
              <b>Monitoring Consent:</b> I agree to share my daily health check-in data (pain levels, symptoms, medication adherence) with my assigned doctor for the purpose of medical monitoring.
            </Typography>
          }
          sx={{mb: 2}}
        />

        <FormControlLabel
          control={<Checkbox checked={messaging} onChange={(e) => setMessaging(e.target.checked)} />}
          label={
            <Typography variant="body2">
              <b>Messaging Consent:</b> I agree to receive secure messages and automated alerts from my doctor and the system regarding my recovery progress.
            </Typography>
          }
        />

        {error && (
          <Typography color="error" variant="caption" display="block" sx={{mt: 2}}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!monitoring || !messaging}>
                    I Agree & Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsentModal;
