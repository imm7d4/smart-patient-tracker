import api from '../api/axios';

const submitCheckIn = (data) => api.post('/checkins', data);
const getHistory = () => api.get('/checkins/history');

export default { submitCheckIn, getHistory };
