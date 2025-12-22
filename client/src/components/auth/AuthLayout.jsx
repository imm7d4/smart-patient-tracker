import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const AuthLayout = ({ children }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: theme.custom.auth.gradientBackground,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, transparent 70%)',
                    animation: 'pulse 8s ease-in-out infinite',
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-50%',
                    left: '-50%',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle, rgba(38, 166, 154, 0.1) 0%, transparent 70%)',
                    animation: 'pulse 10s ease-in-out infinite reverse',
                },
                '@keyframes pulse': {
                    '0%, 100%': {
                        opacity: 0.5,
                        transform: 'scale(1)',
                    },
                    '50%': {
                        opacity: 0.8,
                        transform: 'scale(1.1)',
                    },
                },
            }}
        >
            <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '450px', px: 2 }}>
                {children}
            </Box>
        </Box>
    );
};

export default AuthLayout;
