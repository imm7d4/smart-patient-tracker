import {Card, CardContent, Typography, Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {TrendingUp, TrendingDown, Remove} from '@mui/icons-material';

const PatientCard = ({
  title,
  value,
  icon,
  status = 'neutral', // good, warning, alert, neutral
  trend, // up, down, stable
  subtitle,
  ...props
}) => {
  const theme = useTheme();

  const statusColors = {
    good: '#66bb6a',
    warning: '#ff9800',
    alert: '#ef5350',
    neutral: theme.palette.primary.main,
  };

  const borderColor = statusColors[status] || statusColors.neutral;

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp sx={{fontSize: 16, color: '#ef5350'}} />;
    if (trend === 'down') return <TrendingDown sx={{fontSize: 16, color: '#66bb6a'}} />;
    if (trend === 'stable') return <Remove sx={{fontSize: 16, color: theme.palette.text.secondary}} />;
    return null;
  };

  return (
    <Card
      sx={{
        'background': theme.custom.auth.cardBackground,
        'backdropFilter': theme.custom.auth.cardBackdrop,
        'border': `2px solid ${borderColor}`,
        'borderRadius': 3,
        'transition': theme.custom.transitions.normal,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${borderColor}40`,
        },
        ...props.sx,
      }}
      {...props}
    >
      <CardContent>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            {icon && (
              <Box sx={{
                color: borderColor,
                display: 'flex',
                alignItems: 'center',
              }}>
                {icon}
              </Box>
            )}
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
          </Box>
          {getTrendIcon()}
        </Box>

        <Typography variant="h4" fontWeight={700} sx={{mb: 0.5, color: borderColor}}>
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientCard;
