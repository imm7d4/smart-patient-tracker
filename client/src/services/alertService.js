import api from '../api/axios';

const getAlerts = () => api.get('/alerts');

const markAsRead = (id) => api.put(`/alerts/${id}/read`);

const alertService = {
    getAlerts,
    markAsRead
};

export default alertService;
