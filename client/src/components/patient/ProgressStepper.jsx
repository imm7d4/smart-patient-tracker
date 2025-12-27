import { Stepper, Step, StepLabel, Box, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Check } from '@mui/icons-material';

const ProgressStepper = ({ steps, activeStep, completedSteps = [], ...props }) => {
    const theme = useTheme();

    const progress = ((activeStep + 1) / steps.length) * 100;

    return (
        <Box sx={{ width: '100%' }}>
            {/* Progress Bar */}
            <Box sx={{ mb: 3 }}>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(148, 163, 184, 0.2)',
                        '& .MuiLinearProgress-bar': {
                            background: theme.custom.auth.gradientPrimary,
                            borderRadius: 4,
                        },
                    }}
                />
            </Box>

            {/* Stepper */}
            <Stepper
                activeStep={activeStep}
                alternativeLabel
                sx={{
                    '& .MuiStepLabel-root .Mui-completed': {
                        color: theme.palette.success.main,
                    },
                    '& .MuiStepLabel-root .Mui-active': {
                        color: theme.palette.primary.main,
                    },
                    '& .MuiStepLabel-label': {
                        color: theme.palette.text.secondary,
                        '&.Mui-active': {
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                        },
                        '&.Mui-completed': {
                            color: theme.palette.success.main,
                        },
                    },
                }}
                {...props}
            >
                {steps.map((step, index) => {
                    const isCompleted = completedSteps.includes(index) || index < activeStep;

                    return (
                        <Step key={step.label} completed={isCompleted}>
                            <StepLabel
                                StepIconComponent={() => (
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: isCompleted
                                                ? theme.palette.success.main
                                                : index === activeStep
                                                    ? theme.custom.auth.gradientPrimary
                                                    : 'rgba(148, 163, 184, 0.2)',
                                            color: 'white',
                                            transition: theme.custom.transitions.normal,
                                            boxShadow: index === activeStep
                                                ? `0 0 0 4px ${theme.palette.primary.main}20`
                                                : 'none',
                                        }}
                                    >
                                        {isCompleted ? (
                                            <Check sx={{ fontSize: 20 }} />
                                        ) : (
                                            step.icon || (index + 1)
                                        )}
                                    </Box>
                                )}
                            >
                                {step.label}
                            </StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
        </Box>
    );
};

export default ProgressStepper;
