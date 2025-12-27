import { Card, CardContent, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const HealthMetricCard = ({
    icon,
    label,
    value,
    unit,
    status = 'neutral', // good, warning, alert, neutral
    ...props
}) => {
    const theme = useTheme();

    const statusColors = {
        good: '#66bb6a',
        warning: '#ff9800',
        alert: '#ef5350',
        neutral: theme.palette.primary.main,
    };

    const color = statusColors[status] || statusColors.neutral;

    return (
        <Card
            sx={{
                background: theme.custom.auth.cardBackground,
                backdropFilter: theme.custom.auth.cardBackdrop,
                border: theme.custom.auth.cardBorder,
                borderRadius: 2,
                transition: theme.custom.transitions.normal,
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                },
                ...props.sx,
            }}
            {...props}
        >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: `${color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        mb: 2,
                        color: color,
                    }}
                >
                    {icon}
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {label}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5 }}>
                    <Typography variant="h4" fontWeight={700} sx={{ color: color }}>
                        {value}
                    </Typography>
                    {unit && (
                        <Typography variant="body2" color="text.secondary">
                            {unit}
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default HealthMetricCard;
