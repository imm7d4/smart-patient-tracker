import api from '../api/axios';

const getStats = () => api.get('/admin/stats');
const getAllUsers = () => api.get('/admin/users');
const toggleUserStatus = (id) => api.patch(`/admin/users/${id}/toggle-status`);
const getAuditLogs = (params) => api.get('/admin/audit-logs', { params });
const getDoctorStats = (timeframe) => api.get(`/admin/stats/doctors?timeframe=${timeframe}`);


const adminService = {
    getStats,
    getAllUsers,
    toggleUserStatus,
    getAuditLogs,
    getDoctorStats
};

export default adminService;
