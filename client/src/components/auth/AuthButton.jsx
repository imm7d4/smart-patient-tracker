import {Button, CircularProgress} from '@mui/material';
import {useTheme} from '@mui/material/styles';

const AuthButton = ({children, loading = false, size, ...props}) => {
  const theme = useTheme();

  return (
    <Button
      fullWidth={!size || size === 'large'}
      variant="contained"
      size={size}
      disabled={loading}
      sx={{
        'py': size === 'small' ? 1 : size === 'medium' ? 1.25 : 1.5,
        'px': size === 'small' ? 2 : size === 'medium' ? 3 : 4,
        'fontSize': size === 'small' ? '0.875rem' : size === 'medium' ? '0.9375rem' : '1rem',
        'fontWeight': 600,
        'textTransform': 'none',
        'background': theme.custom.auth.gradientPrimary,
        'boxShadow': '0 4px 12px rgba(33, 150, 243, 0.3)',
        'transition': theme.custom.transitions.normal,
        '&:hover': {
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
        '&.Mui-disabled': {
          background: 'rgba(148, 163, 184, 0.2)',
          color: 'rgba(255, 255, 255, 0.3)',
        },
        ...props.sx,
      }}
      {...props}
    >
      {loading ? (
                <CircularProgress size={24} sx={{color: 'white'}} />
            ) : (
                children
            )}
    </Button>
  );
};

export default AuthButton;
