import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Box, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import adminService from '../../services/adminService';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [timeframe, setTimeframe] = useState('7');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await adminService.getStats();
            setStats(res.data.data);
        } catch (error) {
            console.error('Error fetching admin stats', error);
        }
    };

    if (!stats) return <Typography align="center" variant="h6" sx={{ mt: 5 }}>Loading Analytics...</Typography>;

    const riskData = [
        { name: 'Normal', value: stats.health.normal, color: '#4caf50' },
        { name: 'Monitor', value: stats.health.warning, color: '#ff9800' },
        { name: 'Critical', value: stats.health.critical, color: '#f44336' },
    ];

    const userData = [
        { name: 'Patients', count: stats.users.patients },
        { name: 'Doctors', count: stats.users.doctors },
        { name: 'Active Plans', count: stats.plans.active },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
                System Analytics
            </Typography>

            {/* Key Metrics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%', borderRadius: 2 }}>
                        <Typography color="textSecondary" variant="subtitle1">Total Patients</Typography>
                        <Typography variant="h3" color="primary" fontWeight="bold">{stats.users.patients}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%', borderRadius: 2 }}>
                        <Typography color="textSecondary" variant="subtitle1">Total Doctors</Typography>
                        <Typography variant="h3" color="secondary" fontWeight="bold">{stats.users.doctors}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%', borderRadius: 2 }}>
                        <Typography color="textSecondary" variant="subtitle1">Active Plans</Typography>
                        <Typography variant="h3" sx={{ color: '#00bcd4' }} fontWeight="bold">{stats.plans.active}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%', borderRadius: 2 }}>
                        <Typography color="textSecondary" variant="subtitle1">High Risk Patients</Typography>
                        <Typography variant="h3" color="error" fontWeight="bold">{stats.health.critical}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Quick Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
                <Button component={Link} to="/admin/users" variant="contained" color="primary">Manage Users</Button>
                <Button component={Link} to="/admin/audit-logs" variant="contained" color="secondary">View Audit Logs</Button>
            </Box>

            {/* Charts Section */}
            <Grid container spacing={4}>
                {/* Risk Distribution Chart */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: 400 }}>
                        <Typography variant="h6" align="center" gutterBottom>Patient Risk Distribution</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={riskData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                                >
                                    {riskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: 'none' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* User & Plan Activity Chart */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: 400 }}>
                        <Typography variant="h6" align="center" gutterBottom>System Activity</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={userData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e1e1e', border: 'none' }} />
                                <Bar dataKey="count" fill="#8884d8" barSize={50}>
                                    {userData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#2196f3', '#9c27b0', '#00bcd4'][index]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>


            {/* Doctor Load Monitoring Section */}
            <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" fontWeight="bold">Doctor Workload Monitoring</Typography>
                    <Box>
                        <Button
                            variant={timeframe === '7' ? 'contained' : 'outlined'}
                            onClick={() => setTimeframe('7')}
                            sx={{ mr: 1 }}
                        >
                            Last 7 Days
                        </Button>
                        <Button
                            variant={timeframe === '30' ? 'contained' : 'outlined'}
                            onClick={() => setTimeframe('30')}
                        >
                            Last 30 Days
                        </Button>
                    </Box>
                </Box>

                <DoctorLoadTable timeframe={timeframe} />
            </Paper>
        </Container >
    );
};

const DoctorLoadTable = ({ timeframe }) => {
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        const fetchDoctorStats = async () => {
            try {
                // Using adminService directly or axios if service update skipped
                // Assuming adminService.getDoctorStats exists or we fetch directly
                // For safety in this environment, I'll inline the fetch if service not updated, 
                // but let's assume I update service or use direct axios.
                // Actually, I should update adminService first.
                // But for now, I'll implement fetch logic here to ensure it works.
                // Wait, I cannot use axios directly if I don't import it.
                // Better to use adminService. 
                // I will assume adminService.getDoctorStats(timeframe) will be created.
                // Or I can add it to this file if I replace imports.
                // Let's rely on adminService and I will update it in next step.
                const res = await adminService.getDoctorStats(timeframe);
                setDoctors(res.data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchDoctorStats();
    }, [timeframe]);

    return (
        <Box overflow="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Doctor</th>
                        <th style={{ padding: '12px' }}>Active Patients</th>
                        <th style={{ padding: '12px' }}>Alerts ({timeframe}d)</th>
                        <th style={{ padding: '12px' }}>Critical</th>
                        <th style={{ padding: '12px' }}>Load Status</th>
                        <th style={{ padding: '12px' }}>Avg Reply</th>
                        <th style={{ padding: '12px' }}>&lt; 24h Rep %</th>
                    </tr>
                </thead>
                <tbody>
                    {doctors.map(doc => (
                        <tr key={doc._id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px' }}>
                                <Typography fontWeight="bold">{doc.name}</Typography>
                                <Typography variant="caption" color="textSecondary">{doc.email}</Typography>
                            </td>
                            <td style={{ padding: '12px' }}>{doc.activePatients}</td>
                            <td style={{ padding: '12px' }}>{doc.totalAlerts}</td>
                            <td style={{ padding: '12px', color: doc.criticalAlerts > 0 ? 'red' : 'inherit' }}>{doc.criticalAlerts}</td>
                            <td style={{ padding: '12px' }}>
                                {doc.activePatients > 10 ?
                                    <span style={{ color: 'orange', fontWeight: 'bold' }}>High</span> :
                                    <span style={{ color: 'green' }}>Normal</span>
                                }
                            </td>
                            <td style={{ padding: '12px' }}>{doc.avgResponseTime || '-'} h</td>
                            <td style={{ padding: '12px' }}>{doc.responseRate24h || 0}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Box>
    );
};

export default AdminDashboard;
