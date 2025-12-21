import api from '../api/axios';

const getPatientStatuses = () => api.get('/checkins/dashboard');
const getPatientHistory = (patientId) => api.get(`/checkins/history/${patientId}`);

export default { getPatientStatuses, getPatientHistory };
