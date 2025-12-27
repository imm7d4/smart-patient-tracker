import api from '@/api/axios';

const createTreatment = (data) => api.post('/treatments', data);
const getTreatments = (params) => api.get('/treatments', {params});
const getTreatmentById = (id) => api.get(`/treatments/${id}`);

export default {createTreatment, getTreatments, getTreatmentById};
