import { Box, Typography, Slider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    SentimentVerySatisfied,
    SentimentSatisfied,
    SentimentNeutral,
    SentimentDissatisfied,
    SentimentVeryDissatisfied,
} from '@mui/icons-material';

const PainLevelSlider = ({ value, onChange, showEmojis = true, ...props }) => {
    const theme = useTheme();

    const getColor = (val) => {
        if (val <= 2) return '#66bb6a'; // Green
        if (val <= 4) return '#9ccc65'; // Light green
        if (val <= 6) return '#ffeb3b'; // Yellow
        if (val <= 8) return '#ff9800'; // Orange
        return '#ef5350'; // Red
    };

    const getEmoji = (val) => {
        if (val <= 2) return <SentimentVerySatisfied sx={{ fontSize: 48, color: getColor(val) }} />;
        if (val <= 4) return <SentimentSatisfied sx={{ fontSize: 48, color: getColor(val) }} />;
        if (val <= 6) return <SentimentNeutral sx={{ fontSize: 48, color: getColor(val) }} />;
        if (val <= 8) return <SentimentDissatisfied sx={{ fontSize: 48, color: getColor(val) }} />;
        return <SentimentVeryDissatisfied sx={{ fontSize: 48, color: getColor(val) }} />;
    };

    const getPainLabel = (val) => {
        if (val <= 2) return 'Minimal';
        if (val <= 4) return 'Mild';
        if (val <= 6) return 'Moderate';
        if (val <= 8) return 'Severe';
        return 'Extreme';
    };

    return (
        <Box sx={{ width: '100%', px: 2 }}>
            {showEmojis && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    {getEmoji(value)}
                </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Typography variant="h3" fontWeight={700} sx={{ color: getColor(value) }}>
                    {value}
                </Typography>
                <Typography variant="h6" sx={{ ml: 1, mt: 2, color: 'text.secondary' }}>
                    / 10
                </Typography>
            </Box>

            <Typography
                variant="h6"
                align="center"
                sx={{ mb: 3, color: getColor(value), fontWeight: 600 }}
            >
                {getPainLabel(value)}
            </Typography>

            <Slider
                value={value}
                onChange={onChange}
                min={1}
                max={10}
                step={1}
                marks={[
                    { value: 1, label: '1' },
                    { value: 2, label: '2' },
                    { value: 3, label: '3' },
                    { value: 4, label: '4' },
                    { value: 5, label: '5' },
                    { value: 6, label: '6' },
                    { value: 7, label: '7' },
                    { value: 8, label: '8' },
                    { value: 9, label: '9' },
                    { value: 10, label: '10' },
                ]}
                sx={{
                    height: 12,
                    '& .MuiSlider-track': {
                        background: `linear-gradient(to right, #66bb6a, #ffeb3b, #ff9800, #ef5350)`,
                        border: 'none',
                    },
                    '& .MuiSlider-rail': {
                        background: 'rgba(148, 163, 184, 0.2)',
                    },
                    '& .MuiSlider-thumb': {
                        width: 28,
                        height: 28,
                        backgroundColor: getColor(value),
                        border: '3px solid white',
                        boxShadow: `0 0 0 4px ${getColor(value)}40`,
                        '&:hover, &.Mui-focusVisible': {
                            boxShadow: `0 0 0 8px ${getColor(value)}30`,
                        },
                    },
                    '& .MuiSlider-mark': {
                        backgroundColor: 'transparent',
                    },
                    '& .MuiSlider-markLabel': {
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem',
                    },
                }}
                {...props}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, px: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    No Pain
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Worst Pain
                </Typography>
            </Box>
        </Box>
    );
};

export default PainLevelSlider;
