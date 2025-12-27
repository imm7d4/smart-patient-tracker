import { Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const AuthCard = ({ children, ...props }) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                background: theme.custom.auth.cardBackground,
                backdropFilter: theme.custom.auth.cardBackdrop,
                border: theme.custom.auth.cardBorder,
                borderRadius: 3,
                p: 4,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                transition: theme.custom.transitions.normal,
                '&:hover': {
                    boxShadow: '0 24px 70px rgba(0, 0, 0, 0.4)',
                },
                ...props.sx,
            }}
            {...props}
        >
            {children}
        </Paper>
    );
};

export default AuthCard;
