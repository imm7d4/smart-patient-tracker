import {useState, useContext} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {Typography, Box, Alert, Fade, MenuItem, LinearProgress} from '@mui/material';
import {
  PersonAdd,
  Email,
  Lock,
  Person,
  LocalHospital,
  AdminPanelSettings,
  Accessible,
} from '@mui/icons-material';
import AuthContext from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PATIENT',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {register} = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const getPasswordStrength = (password) => {
    if (!password) return {strength: 0, label: '', color: ''};

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

    if (strength < 40) return {strength, label: 'Weak', color: '#ef5350'};
    if (strength < 70) return {strength, label: 'Medium', color: '#ff9800'};
    return {strength, label: 'Strong', color: '#66bb6a'};
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'PATIENT':
        return <Accessible sx={{mr: 1, fontSize: 20}} />;
      case 'DOCTOR':
        return <LocalHospital sx={{mr: 1, fontSize: 20}} />;
      case 'ADMIN':
        return <AdminPanelSettings sx={{mr: 1, fontSize: 20}} />;
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <Box sx={{textAlign: 'center', mb: 4}}>
          <PersonAdd sx={{fontSize: 48, color: 'primary.main', mb: 2}} />
          <Typography variant="h5" component="h1" sx={{fontWeight: 700, mb: 1}}>
                        Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
                        Join us to manage your healthcare journey
          </Typography>
        </Box>

        <Fade in={!!error}>
          <Box sx={{mb: 2}}>
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
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            required
            value={formData.name}
            onChange={handleChange}
            icon={
              <Person sx={{color: 'text.secondary', fontSize: 20}} />
            }
          />

          <AuthInput
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            icon={
              <Email sx={{color: 'text.secondary', fontSize: 20}} />
            }
          />

          <AuthInput
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            icon={
              <Lock sx={{color: 'text.secondary', fontSize: 20}} />
            }
          />

          {formData.password && (
            <Fade in={!!formData.password}>
              <Box sx={{mb: 2}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.5}}>
                  <Typography variant="caption" color="text.secondary">
                                        Password Strength
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: passwordStrength.color,
                      fontWeight: 600,
                    }}
                  >
                    {passwordStrength.label}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength.strength}
                  sx={{
                    'height': 6,
                    'borderRadius': 3,
                    'backgroundColor': 'rgba(148, 163, 184, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: passwordStrength.color,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            </Fade>
          )}

          <AuthInput
            select
            label="Role"
            name="role"
            required
            value={formData.role}
            onChange={handleChange}
            SelectProps={{
              renderValue: (value) => (
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                  {getRoleIcon(value)}
                  {value.charAt(0) + value.slice(1).toLowerCase()}
                </Box>
              ),
            }}
          >
            <MenuItem value="PATIENT">
              <Accessible sx={{mr: 1, fontSize: 20}} />
                            Patient
            </MenuItem>
            <MenuItem value="DOCTOR">
              <LocalHospital sx={{mr: 1, fontSize: 20}} />
                            Doctor
            </MenuItem>
            <MenuItem value="ADMIN">
              <AdminPanelSettings sx={{mr: 1, fontSize: 20}} />
                            Admin
            </MenuItem>
          </AuthInput>

          <AuthButton
            type="submit"
            loading={loading}
            sx={{mt: 1, mb: 3}}
          >
                        Sign Up
          </AuthButton>

          <Box sx={{textAlign: 'center'}}>
            <Typography variant="body2" color="text.secondary">
                            Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#2196f3',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.color = '#64b5f6'}
                onMouseLeave={(e) => e.target.style.color = '#2196f3'}
              >
                                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </AuthCard>
    </AuthLayout>
  );
};

export default Register;

