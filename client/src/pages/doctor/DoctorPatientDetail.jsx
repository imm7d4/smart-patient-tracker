import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Grid } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dashboardService from '../../services/dashboardService';

const DoctorPatientDetail = () => {
    const { id } = useParams();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await dashboardService.getPatientHistory(id);
                const data = res.data.data.map(item => ({
                    ...item,
                    date: new Date(item.date).toLocaleDateString()
                }));
                setHistory(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchHistory();
    }, [id]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>Patient Recovery Trends</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                        <Typography variant="h6" align="center" gutterBottom>Risk Score Over Time</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e1e1e', border: 'none' }}
                                    formatter={(value, name, props) => {
                                        if (name === 'riskScore' && props.payload.riskReasons && props.payload.riskReasons.length > 0) {
                                            return [value, `Score (${props.payload.riskReasons.join(', ')})`];
                                        }
                                        return [value, name];
                                    }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="riskScore" stroke="#d32f2f" strokeWidth={3} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                        <Typography variant="h6" align="center" gutterBottom>Pain Level Over Time</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 10]} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: 'none' }} />
                                <Legend />
                                <Line type="monotone" dataKey="painLevel" stroke="#1976d2" strokeWidth={3} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DoctorPatientDetail;
