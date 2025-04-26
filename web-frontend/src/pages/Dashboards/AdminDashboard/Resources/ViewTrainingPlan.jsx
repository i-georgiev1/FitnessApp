import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Alert,
    Chip,
    Stack,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminSidebar from '../AdminSidebar';
import axiosInstance from '../../../../config/axios';

const ViewTrainingPlan = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [trainingPlan, setTrainingPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [filters, setFilters] = useState({
        weekNumber: 'all',
        dayNumber: 'all'
    });

    useEffect(() => {
        fetchTrainingPlan();
    }, [id]);

    const fetchTrainingPlan = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/admin/training-plans/${id}`);
            setTrainingPlan(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching training plan:', err);
            setError(t('Failed to load training plan'));
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (level) => {
        const colors = {
            'beginner': 'success',
            'intermediate': 'warning',
            'advanced': 'error'
        };
        return colors[level?.toLowerCase()] || 'default';
    };

    const filterExercises = (exercises) => {
        if (!exercises) return [];

        return exercises.filter(exercise => {
            const weekMatch = filters.weekNumber === 'all' || exercise.week_number === parseInt(filters.weekNumber);
            const dayMatch = filters.dayNumber === 'all' || exercise.day_number === parseInt(filters.dayNumber);
            return weekMatch && dayMatch;
        });
    };

    if (loading) {
        return (
            <Box display="flex">
                <AdminSidebar expanded={sidebarExpanded} onToggle={(expanded) => setSidebarExpanded(expanded)} />
                <Box component="main" sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${sidebarExpanded ? '270px' : '65px'})` },
                    ml: { sm: sidebarExpanded ? '270px' : '65px' },
                    transition: theme => theme.transitions.create(['width', 'margin-left'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                        <CircularProgress />
                    </Box>
                </Box>
            </Box>
        );
    }

    if (!trainingPlan) {
        return (
            <Box display="flex">
                <AdminSidebar expanded={sidebarExpanded} onToggle={(expanded) => setSidebarExpanded(expanded)} />
                <Box component="main" sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${sidebarExpanded ? '270px' : '65px'})` },
                    ml: { sm: sidebarExpanded ? '270px' : '65px' },
                    transition: theme => theme.transitions.create(['width', 'margin-left'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}>
                    <Alert severity="error">{t('Training plan not found')}</Alert>
                </Box>
            </Box>
        );
    }

    return (
        <Box display="flex">
            <AdminSidebar expanded={sidebarExpanded} onToggle={(expanded) => setSidebarExpanded(expanded)} />
            <Box component="main" sx={{
                flexGrow: 1,
                p: 3,
                width: { sm: `calc(100% - ${sidebarExpanded ? '270px' : '65px'})` },
                ml: { sm: sidebarExpanded ? '270px' : '65px' },
                transition: theme => theme.transitions.create(['width', 'margin-left'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            {trainingPlan.title}
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" color="text.secondary">
                                {t('Duration')}: {trainingPlan.duration_weeks} {t('weeks')} | {t('Training Frequency')}: {trainingPlan.training_frequency} {t('times per week')}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                {t('Created by')}: {trainingPlan.coach?.first_name} {trainingPlan.coach?.last_name}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>{t('Week')}</InputLabel>
                            <Select
                                value={filters.weekNumber}
                                label={t('Week')}
                                onChange={(e) => setFilters({ ...filters, weekNumber: e.target.value })}
                            >
                                <MenuItem value="all">{t('All Weeks')}</MenuItem>
                                {[...Array(trainingPlan.duration_weeks || 12)].map((_, i) => (
                                    <MenuItem key={i + 1} value={i + 1}>
                                        {t('Week')} {i + 1}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>{t('Day')}</InputLabel>
                            <Select
                                value={filters.dayNumber}
                                label={t('Day')}
                                onChange={(e) => setFilters({ ...filters, dayNumber: e.target.value })}
                            >
                                <MenuItem value="all">{t('All Days')}</MenuItem>
                                {[...Array(7)].map((_, i) => (
                                    <MenuItem key={i + 1} value={i + 1}>
                                        {t('Day')} {i + 1}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/admin/training-plans')}
                        >
                            {t('Back to Training Plans')}
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {t('Plan Overview')}
                                </Typography>
                                <Stack spacing={1}>
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                            {t('Difficulty Level')}:
                                        </Typography>
                                        <Chip
                                            label={trainingPlan.difficulty_level}
                                            color={getDifficultyColor(trainingPlan.difficulty_level)}
                                            size="small"
                                        />
                                    </Box>
                                    <Typography variant="body2">
                                        {t('Duration')}: {trainingPlan.duration_weeks} {t('weeks')}
                                    </Typography>
                                    <Typography variant="body2">
                                        {t('Training Frequency')}: {trainingPlan.training_frequency} {t('times per week')}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {t('Plan Details')}
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    {trainingPlan.description}
                                </Typography>
                                {trainingPlan.training_objective && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            {t('Training Objective')}:
                                        </Typography>
                                        <Chip label={trainingPlan.training_objective} />
                                    </Box>
                                )}
                                {trainingPlan.focus_areas && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            {t('Focus Areas')}:
                                        </Typography>
                                        <Chip label={trainingPlan.focus_areas} />
                                    </Box>
                                )}
                                {trainingPlan.exercise_types && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            {t('Exercise Types')}:
                                        </Typography>
                                        <Chip label={trainingPlan.exercise_types} />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Typography variant="h5" sx={{ mb: 3 }}>
                    {t('Exercises')}
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={3}>
                    {filterExercises(trainingPlan.exercises).map((exercise) => (
                        <Grid item xs={12} sm={6} md={4} key={exercise.exercise_id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {exercise.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {exercise.description}
                                    </Typography>
                                    <Typography variant="body2">
                                        {t('Sets')}: {exercise.sets}
                                    </Typography>
                                    <Typography variant="body2">
                                        {t('Reps')}: {exercise.reps}
                                    </Typography>
                                    <Typography variant="body2">
                                        {t('Week')}: {exercise.week_number}, {t('Day')}: {exercise.day_number}
                                    </Typography>
                                    {exercise.intensity && (
                                        <Typography variant="body2">
                                            {t('Intensity')}: {exercise.intensity}
                                        </Typography>
                                    )}
                                    {exercise.rest_period && (
                                        <Typography variant="body2">
                                            {t('Rest Period')}: {exercise.rest_period}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default ViewTrainingPlan; 