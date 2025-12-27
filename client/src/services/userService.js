import api from '@/api/axios';

const getPatients = () => api.get('/users/patients');

export default {getPatients};
