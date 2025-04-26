import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Rating,
    useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddTaskIcon from '@mui/icons-material/AddTask';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../../config/axios';
import { API_ENDPOINTS } from '../../../config/api';
import DashboardSidebar from './DashboardSidebar';

const UserExercises = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [trainingPlan, setTrainingPlan] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [progressRecords, setProgressRecords] = useState([]);
    const [progressDialog, setProgressDialog] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [progressForm, setProgressForm] = useState({
        sets_completed: '',
        reps_completed: '',
        weight_used: '',
        duration_minutes: '',
        notes: '',
        rating: 3
    });
    const [sidebarExpanded, setSidebarExpanded] = useState(() => {
        const savedState = localStorage.getItem('userSidebarState');
        return savedState ? JSON.parse(savedState) : true;
    });

    // Handle sidebar toggle
    const handleSidebarToggle = (expanded) => {
        setSidebarExpanded(expanded);
        localStorage.setItem('userSidebarState', JSON.stringify(expanded));
    };

    useEffect(() => {
        fetchUserTrainingPlan();
        fetchProgressRecords();
    }, []);

    const fetchUserTrainingPlan = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(API_ENDPOINTS.user.trainingPlan);
            setTrainingPlan(response.data.training_plan);
            setExercises(response.data.exercises || []);
        } catch (error) {
            setError(t('Failed to load your training plan'));
        } finally {
            setLoading(false);
        }
    };

    const fetchProgressRecords = async () => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.user.progress);
            setProgressRecords(response.data.progress_records || []);
        } catch (error) {
            setError(t('Failed to load progress records'));
        }
    };

    const handleAddProgress = (exercise) => {
        setSelectedExercise(exercise);
        // Check if there's an existing record for this exercise
        const existingRecord = progressRecords.find(record => record.exercise_id === exercise.exercise_id);

        if (existingRecord) {
            // Load existing data
            setProgressForm({
                sets_completed: existingRecord.sets_completed,
                reps_completed: existingRecord.reps_completed,
                weight_used: existingRecord.weight_used || '',
                duration_minutes: existingRecord.duration_minutes || '',
                notes: existingRecord.notes || '',
                rating: existingRecord.rating || 3
            });
        } else {
            // Reset form for new record
            setProgressForm({
                sets_completed: '',
                reps_completed: '',
                weight_used: '',
                duration_minutes: '',
                notes: '',
                rating: 3
            });
        }
        setProgressDialog(true);
    };

    const handleProgressSubmit = async () => {
        try {
            if (!progressForm.sets_completed || !progressForm.reps_completed) {
                setError(t('Please fill in all required fields'));
                return;
            }

            const formData = {
                ...progressForm,
                exercise_id: selectedExercise.exercise_id
            };

            // Check if we're updating an existing record
            const existingRecord = progressRecords.find(record => record.exercise_id === selectedExercise.exercise_id);


            let response;
            if (existingRecord && existingRecord.tracking_id) {
                // Update existing record
                response = await axiosInstance.put(`${API_ENDPOINTS.user.progress}/${existingRecord.tracking_id}`, formData);
            } else {
                // Create new record
                response = await axiosInstance.post(API_ENDPOINTS.user.progress, formData);
            }

            await fetchProgressRecords(); // Refresh progress records after adding/updating
            setProgressDialog(false);
            setError('');
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('Failed to save progress record');
            setError(errorMessage);
            // Keep the dialog open if there's an error
            return;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            </Container>
        );
    }

    if (!trainingPlan) {
        return (
            <Container>
                <Alert severity="info" sx={{ mt: 2 }}>
                    {t('No training plan is currently assigned to you. Please contact your coach.')}
                </Alert>
            </Container>
        );
    }

    // Group exercises by week and day
    const groupedExercises = exercises.reduce((acc, exercise) => {
        const week = exercise.week_number;
        const day = exercise.day_number;

        if (!acc[week]) {
            acc[week] = {};
        }
        if (!acc[week][day]) {
            acc[week][day] = [];
        }

        acc[week][day].push(exercise);
        return acc;
    }, {});

    return (
        <Box display="flex">
            <DashboardSidebar expanded={sidebarExpanded} onToggle={handleSidebarToggle} />
            <Box component="main" sx={{
                flexGrow: 1,
                p: 3,
                width: { sm: `calc(100% - ${sidebarExpanded ? '270px' : '65px'})` },
                ml: { sm: sidebarExpanded ? '270px' : '65px' },
                transition: theme.transitions.create(['width', 'margin-left'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            }}>
                <Box sx={{ mt: 4, mb: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        {trainingPlan.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        {trainingPlan.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Chip
                            label={`${t('Duration')}: ${trainingPlan.duration_weeks} ${t('weeks')}`}
                            sx={{ mr: 1, mb: 1 }}
                        />
                        <Chip
                            label={`${t('Difficulty')}: ${trainingPlan.difficulty_level}`}
                            sx={{ mr: 1, mb: 1 }}
                        />
                        <Chip
                            label={`${t('Frequency')}: ${trainingPlan.training_frequency} ${t('days/week')}`}
                            sx={{ mr: 1, mb: 1 }}
                        />
                    </Box>
                </Box>

                {Object.keys(groupedExercises).sort((a, b) => a - b).map(weekNum => (
                    <Accordion key={weekNum} defaultExpanded={weekNum === '1'}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">
                                {t('Week')} {weekNum}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={3}>
                                {Object.keys(groupedExercises[weekNum])
                                    .sort((a, b) => a - b)
                                    .map(dayNum => (
                                        <Grid item xs={12} key={`${weekNum}-${dayNum}`}>
                                            <Typography variant="h6" gutterBottom>
                                                {t('Day')} {dayNum}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                {groupedExercises[weekNum][dayNum]
                                                    .sort((a, b) => a.order_in_day - b.order_in_day)
                                                    .map((exercise) => (
                                                        <Grid item xs={12} md={6} key={exercise.exercise_id}>
                                                            <Card>
                                                                <CardContent>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                                        <Typography variant="h6">
                                                                            {exercise.name}
                                                                        </Typography>
                                                                        <Button
                                                                            variant="outlined"
                                                                            size="small"
                                                                            startIcon={<AddTaskIcon />}
                                                                            onClick={() => handleAddProgress(exercise)}
                                                                            color={progressRecords.some(record => record.exercise_id === exercise.exercise_id) ? "success" : "primary"}
                                                                        >
                                                                            {t('Record Progress')}
                                                                        </Button>
                                                                    </Box>
                                                                    <Typography variant="body2" color="text.secondary" paragraph>
                                                                        {exercise.description}
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        <strong>{t('Sets')}:</strong> {exercise.sets}
                                                                    </Typography>
                                                                    <Typography variant="body2">
                                                                        <strong>{t('Reps')}:</strong> {exercise.reps}
                                                                    </Typography>
                                                                    {exercise.intensity && (
                                                                        <Typography variant="body2">
                                                                            <strong>{t('Intensity')}:</strong> {exercise.intensity}
                                                                        </Typography>
                                                                    )}
                                                                    {exercise.rest_period && (
                                                                        <Typography variant="body2">
                                                                            <strong>{t('Rest')}:</strong> {exercise.rest_period}
                                                                        </Typography>
                                                                    )}
                                                                    {exercise.special_instructions && (
                                                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                                                            <strong>{t('Instructions')}:</strong> {exercise.special_instructions}
                                                                        </Typography>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    ))}
                                            </Grid>
                                        </Grid>
                                    ))}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                ))}

                {/* Progress Dialog */}
                <Dialog open={progressDialog} onClose={() => setProgressDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {t('Record Progress for')} {selectedExercise?.name}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label={t('Sets Completed')}
                                        type="number"
                                        value={progressForm.sets_completed}
                                        onChange={(e) => setProgressForm(prev => ({
                                            ...prev,
                                            sets_completed: e.target.value
                                        }))}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label={t('Reps Completed')}
                                        type="number"
                                        value={progressForm.reps_completed}
                                        onChange={(e) => setProgressForm(prev => ({
                                            ...prev,
                                            reps_completed: e.target.value
                                        }))}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label={t('Weight Used (kg)')}
                                        type="number"
                                        value={progressForm.weight_used}
                                        onChange={(e) => setProgressForm(prev => ({
                                            ...prev,
                                            weight_used: e.target.value
                                        }))}
                                        inputProps={{ step: "0.1" }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label={t('Duration (minutes)')}
                                        type="number"
                                        value={progressForm.duration_minutes}
                                        onChange={(e) => setProgressForm(prev => ({
                                            ...prev,
                                            duration_minutes: e.target.value
                                        }))}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label={t('Notes')}
                                        multiline
                                        rows={3}
                                        value={progressForm.notes}
                                        onChange={(e) => setProgressForm(prev => ({
                                            ...prev,
                                            notes: e.target.value
                                        }))}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography component="legend">{t('Rating')}</Typography>
                                    <Rating
                                        value={progressForm.rating}
                                        onChange={(event, newValue) => {
                                            setProgressForm(prev => ({
                                                ...prev,
                                                rating: newValue
                                            }));
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setProgressDialog(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button
                            onClick={handleProgressSubmit}
                            variant="contained"
                            color="primary"
                            disabled={!progressForm.sets_completed || !progressForm.reps_completed}
                        >
                            {t('Save')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
};

export default UserExercises;
