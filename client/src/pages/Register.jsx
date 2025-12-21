import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert, MenuItem, Paper } from '@mui/material';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'PATIENT' });
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                <Typography component="h1" variant="h5" sx={{ mb: 2 }}>Sign up</Typography>
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField margin="normal" required fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} />
                    <TextField margin="normal" required fullWidth label="Email Address" name="email" value={formData.email} onChange={handleChange} />
                    <TextField margin="normal" required fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
                    <TextField select margin="normal" required fullWidth label="Role" name="role" value={formData.role} onChange={handleChange}>
                        <MenuItem value="PATIENT">Patient</MenuItem>
                        <MenuItem value="DOCTOR">Doctor</MenuItem>
                        <MenuItem value="ADMIN">Admin</MenuItem>
                    </TextField>
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Sign Up</Button>
                    <Box sx={{ textAlign: 'center' }}>
                        <Link to="/login" style={{ textDecoration: 'none', color: '#90caf9' }}>{"Already have an account? Sign in"}</Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};
export default Register;
