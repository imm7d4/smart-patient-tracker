import {TextField, InputAdornment} from '@mui/material';
import {useTheme} from '@mui/material/styles';

const AuthInput = ({icon, ...props}) => {
  const theme = useTheme();

  return (
    <TextField
      fullWidth
      variant="outlined"
      InputProps={{
        startAdornment: icon ? (
                    <InputAdornment position="start">
                      {icon}
                    </InputAdornment>
                ) : null,
        sx: {
          'color': theme.palette.text.primary,
          '& fieldset': {
            borderColor: 'rgba(148, 163, 184, 0.2)',
            transition: theme.custom.transitions.normal,
          },
          '&:hover fieldset': {
            borderColor: 'rgba(148, 163, 184, 0.3)',
          },
          '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            borderWidth: '2px',
          },
        },
      }}
      InputLabelProps={{
        sx: {
          'color': theme.palette.text.secondary,
          '&.Mui-focused': {
            color: theme.palette.primary.main,
          },
        },
      }}
      sx={{
        'mb': 2,
        '& .MuiOutlinedInput-root': {
          '& input': {
            color: theme.palette.text.primary,
          },
        },
      }}
      {...props}
    />
  );
};

export default AuthInput;
