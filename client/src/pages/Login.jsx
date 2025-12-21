import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert, Paper } from '@mui/material';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login({ email, password });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <Container maxWidth="xs">
            <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                <Typography component="h1" variant="h5" sx={{ mb: 2 }}>Sign in</Typography>
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField
                        data-cy="email-input"
                        margin="normal" required fullWidth label="Email Address" autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        data-cy="password-input"
                        margin="normal" required fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        data-cy="login-submit"
                        type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Sign In</Button>
                    <Box sx={{ textAlign: 'center' }}>
                        <Link to="/register" style={{ textDecoration: 'none', color: '#90caf9' }}>{"Don't have an account? Sign Up"}</Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};
export default Login;
