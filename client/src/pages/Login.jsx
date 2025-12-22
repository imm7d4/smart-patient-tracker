import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Typography, Box, Alert, Fade, InputAdornment } from '@mui/material';
import { Email, Lock, Login as LoginIcon } from '@mui/icons-material';
import AuthContext from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ email, password });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <AuthCard>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sign in to continue to your account
                    </Typography>
                </Box>

                <Fade in={!!error}>
                    <Box sx={{ mb: 2 }}>
                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(239, 83, 80, 0.1)',
                                    border: '1px solid rgba(239, 83, 80, 0.3)',
                                }}
                            >
                                {error}
                            </Alert>
                        )}
                    </Box>
                </Fade>

                <Box component="form" onSubmit={handleSubmit}>
                    <AuthInput
                        data-cy="email-input"
                        label="Email Address"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={
                            <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                        }
                    />

                    <AuthInput
                        data-cy="password-input"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon={
                            <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
                        }
                    />

                    <AuthButton
                        data-cy="login-submit"
                        type="submit"
                        loading={loading}
                        sx={{ mt: 1, mb: 3 }}
                    >
                        Sign In
                    </AuthButton>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                style={{
                                    color: '#2196f3',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    transition: 'color 0.3s ease',
                                }}
                                onMouseEnter={(e) => e.target.style.color = '#64b5f6'}
                                onMouseLeave={(e) => e.target.style.color = '#2196f3'}
                            >
                                Sign Up
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </AuthCard>
        </AuthLayout>
    );
};

export default Login;

