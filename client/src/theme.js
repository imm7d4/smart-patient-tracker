import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark', // Keeping dark mode but fixing contrast
        primary: {
            main: '#90caf9',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
        text: {
            primary: '#ffffff',
            secondary: '#b3b3b3',
        },
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    marginBottom: '1rem',
                },
            },
        },
        MuiContainer: {
            styleOverrides: {
                root: {
                    paddingTop: '2rem',
                    paddingBottom: '2rem',
                },
            },
        },
    },
});

export default theme;
